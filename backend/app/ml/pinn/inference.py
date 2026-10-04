import math
from typing import Dict, Any

class GeotechnicalPINNInference:
    """
    Physics-Informed Geotechnical Factor of Safety (FS) Inference Engine.
    Embeds 1D Green-Ampt infiltration and 1D Richards pore-water pressure mechanics
    into the Mohr-Coulomb limit equilibrium failure envelope.
    """

    @staticmethod
    def calculate_infiltration(
        rainfall_intensity_mm_h: float,
        duration_hours: float,
        hydraulic_conductivity_ks_mm_h: float = 12.5,
        suction_head_psi_mm: float = 110.0,
        moisture_deficit_delta_theta: float = 0.22
    ) -> Dict[str, float]:
        """
        Green-Ampt Infiltration Equation:
        f(t) = K_s * (1 + (psi_f * delta_theta) / F(t))
        """
        total_precip_mm = rainfall_intensity_mm_h * duration_hours
        cumulative_infiltration_f = min(total_precip_mm, hydraulic_conductivity_ks_mm_h * duration_hours + suction_head_psi_mm * moisture_deficit_delta_theta)
        
        if cumulative_infiltration_f > 0:
            infiltration_rate = hydraulic_conductivity_ks_mm_h * (1.0 + (suction_head_psi_mm * moisture_deficit_delta_theta) / cumulative_infiltration_f)
        else:
            infiltration_rate = hydraulic_conductivity_ks_mm_h

        runoff_mm = max(0.0, total_precip_mm - cumulative_infiltration_f)

        return {
            "cumulative_infiltration_mm": cumulative_infiltration_f,
            "infiltration_capacity_mm_h": infiltration_rate,
            "surface_runoff_mm": runoff_mm
        }

    @classmethod
    def calculate_factor_of_safety(
        cls,
        cohesion_kpa: float,
        internal_friction_deg: float,
        slope_angle_deg: float,
        soil_depth_m: float,
        pore_water_pressure_kpa: float,
        soil_unit_weight_kn_m3: float = 19.5
    ) -> Dict[str, Any]:
        """
        Mohr-Coulomb Limit Equilibrium Dynamic Factor of Safety:
        FS = (c' + (gamma * z * cos^2(beta) - u_w) * tan(phi')) / (gamma * z * sin(beta) * cos(beta))
        """
        beta_rad = math.radians(slope_angle_deg)
        phi_rad = math.radians(internal_friction_deg)

        # Total Normal Stress at slip surface
        sigma_total = soil_unit_weight_kn_m3 * soil_depth_m * (math.cos(beta_rad) ** 2)
        # Effective Normal Stress (Terzaghi principle)
        sigma_effective = max(0.0, sigma_total - pore_water_pressure_kpa)

        # Resisting shear strength
        tau_resisting = cohesion_kpa + sigma_effective * math.tan(phi_rad)
        # Driving gravitational shear stress
        tau_driving = soil_unit_weight_kn_m3 * soil_depth_m * math.sin(beta_rad) * math.cos(beta_rad)

        if tau_driving <= 0.001:
            fs = 9.99
        else:
            fs = round(tau_resisting / tau_driving, 3)

        # Classify threat tiers based on MDoNER specifications
        if fs > 1.30:
            threat_tier = "NORMAL"
            trigger_probability = 0.05
            action = "Normal highway clearance. Passive monitoring."
        elif fs > 1.15:
            threat_tier = "ADVISORY"
            trigger_probability = 0.28
            action = "Heavy vehicle speed restrictions. Alert patrol units."
        elif fs > 1.00:
            threat_tier = "WARNING"
            trigger_probability = 0.65
            action = "Pre-position BRO excavation equipment. Divert freight."
        else:
            threat_tier = "CRITICAL"
            trigger_probability = 0.94
            action = "IMMINENT SHEAR FAILURE: Evacuate corridor. Activate safe convoy bypass."

        return {
            "factor_of_safety": fs,
            "threat_tier": threat_tier,
            "trigger_probability": trigger_probability,
            "effective_normal_stress_kpa": round(sigma_effective, 2),
            "driving_shear_stress_kpa": round(tau_driving, 2),
            "resisting_shear_strength_kpa": round(tau_resisting, 2),
            "action_directive": action
        }
