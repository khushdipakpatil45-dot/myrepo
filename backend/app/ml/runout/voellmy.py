import math
from typing import Dict, Any

class VoellmySalmSimulator:
    """
    Voellmy-Salm Rheological Debris Flow Runout Model.
    Calculates turbulent shear resistance and kinetic propagation velocity:
    tau = mu * rho * g * h * cos(beta) + (rho * g * v^2) / xi
    """

    def __init__(
        self,
        coulomb_friction_mu: float = 0.18,
        turbulent_drag_xi_m_s2: float = 500.0,
        debris_density_rho_kg_m3: float = 2100.0,
        gravity_g: float = 9.81
    ):
        self.mu = coulomb_friction_mu
        self.xi = turbulent_drag_xi_m_s2
        self.rho = debris_density_rho_kg_m3
        self.g = gravity_g

    def simulate_runout_kinetics(
        self,
        slip_volume_m3: float,
        drop_height_m: float,
        slope_angle_deg: float,
        distance_to_road_m: float
    ) -> Dict[str, Any]:
        """
        Solves energy dissipation and kinetic runout length to road intersection.
        """
        beta_rad = math.radians(slope_angle_deg)
        
        # Approximate peak velocity using Voellmy asymptotic equilibrium
        # v_max = sqrt(xi * h * (sin(beta) - mu * cos(beta)))
        estimated_flow_height_h = min(4.5, max(1.0, math.pow(slip_volume_m3 / 1000.0, 0.4)))
        driving_term = math.sin(beta_rad) - self.mu * math.cos(beta_rad)
        
        if driving_term > 0:
            terminal_velocity = math.sqrt(self.xi * estimated_flow_height_h * driving_term)
            terminal_velocity = min(28.0, max(4.0, terminal_velocity))
        else:
            terminal_velocity = 4.5

        # Maximum kinetic runout length (Scheidegger / Voellmy reach angle)
        apparent_friction_angle = math.atan(self.mu + (terminal_velocity ** 2) / (self.xi * estimated_flow_height_h))
        max_runout_distance_m = drop_height_m / math.tan(apparent_friction_angle)

        # Time to reach road edge
        reaches_road = max_runout_distance_m >= distance_to_road_m
        time_to_impact_sec = int(distance_to_road_m / (terminal_velocity * 0.65)) if reaches_road else -1
        time_to_impact_min = max(1, math.ceil(time_to_impact_sec / 60)) if time_to_impact_sec > 0 else -1

        # Peak impact dynamic pressure: p_dyn = rho * v^2 (kPa)
        dynamic_pressure_kpa = (self.rho * (terminal_velocity ** 2)) / 1000.0

        return {
            "reaches_road": reaches_road,
            "max_runout_distance_m": round(max_runout_distance_m, 1),
            "distance_to_road_m": distance_to_road_m,
            "time_to_road_cutoff_mins": time_to_impact_min,
            "peak_velocity_m_s": round(terminal_velocity, 1),
            "debris_deposition_depth_m": round(estimated_flow_height_h * 1.25, 2),
            "dynamic_impact_pressure_kpa": round(dynamic_pressure_kpa, 1),
            "estimated_debris_volume_m3": round(slip_volume_m3, 0)
        }
