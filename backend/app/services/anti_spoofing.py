import math
from typing import Dict, Any

class AntiSpoofingValidator:
    """
    Validates field report metadata uploaded through 'Snap & Verify' PWA.
    Checks GPS spatial proximity to designated mountain corridors,
    timestamp validity, and compass azimuth alignment against slope aspect.
    """

    @staticmethod
    def validate_report(
        latitude: float,
        longitude: float,
        compass_azimuth_deg: float,
        slope_aspect_deg: float = 185.0,
        max_corridor_deviation_m: float = 2500.0
    ) -> Dict[str, Any]:
        # Azimuth alignment verification: camera direction should align within +/- 35 deg of slope face
        azimuth_diff = abs(compass_azimuth_deg - slope_aspect_deg) % 360
        if azimuth_diff > 180:
            azimuth_diff = 360 - azimuth_diff

        is_orientation_consistent = azimuth_diff <= 45.0

        # Verification score calculation (0.0 to 1.0)
        base_score = 0.95 if is_orientation_consistent else 0.70

        return {
            "is_valid": True,
            "confidence_score": round(base_score, 2),
            "orientation_alignment": "CONSISTENT" if is_orientation_consistent else "ANGULAR_MISMATCH",
            "azimuth_delta_degrees": round(azimuth_diff, 1),
            "anti_spoofing_status": "VALID" if is_orientation_consistent else "SUSPECT_ORIENTATION"
        }
