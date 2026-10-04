import math
from typing import List, Tuple, Dict, Any

class DInfinityRouting:
    """
    D-Infinity (D_inf) Multi-Directional Flow Routing.
    Allocates kinetic mass flux across triangular facets on digital elevation models (DEM)
    to estimate continuous downstream propagation angles.
    """

    @staticmethod
    def calculate_facet_flow_angles(
        slopes_cardinal: Dict[str, float],
        aspect_deg: float
    ) -> List[Dict[str, Any]]:
        """
        Calculates flow distribution fractions across adjacent slope facets.
        """
        aspect_rad = math.radians(aspect_deg)
        # Flow proportioning based on Tarboton (1997) D_inf formulation
        fractions = []
        angles = [0, 45, 90, 135, 180, 225, 270, 315]
        
        for angle in angles:
            delta = abs(math.degrees(aspect_rad) - angle)
            if delta < 45.0:
                weight = 1.0 - (delta / 45.0)
                fractions.append({"azimuth_deg": angle, "fraction": round(weight, 3)})

        return fractions or [{"azimuth_deg": aspect_deg, "fraction": 1.0}]

    @classmethod
    def generate_runout_polygon(
        cls,
        origin_lat: float,
        origin_lon: float,
        runout_length_m: float,
        aspect_deg: float,
        lateral_spread_angle_deg: float = 30.0
    ) -> Dict[str, Any]:
        """
        Generates a GeoJSON Polygon representing the downstream debris deposition fan.
        """
        # Convert meter offsets to approximate lat/lon degrees (Himalayan latitudes ~27° N)
        meters_per_deg_lat = 110852.0
        meters_per_deg_lon = 99200.0

        flow_rad = math.radians(aspect_deg)
        spread_half = math.radians(lateral_spread_angle_deg / 2.0)

        # Apex (initiation slip point)
        apex = [origin_lon, origin_lat]

        # Right bank expansion
        rad_right = flow_rad + spread_half
        dx_r = (runout_length_m * math.sin(rad_right)) / meters_per_deg_lon
        dy_r = (runout_length_m * math.cos(rad_right)) / meters_per_deg_lat
        right_pt = [round(origin_lon + dx_r, 6), round(origin_lat + dy_r, 6)]

        # Frontal toe point
        dx_f = (runout_length_m * 1.15 * math.sin(flow_rad)) / meters_per_deg_lon
        dy_f = (runout_length_m * 1.15 * math.cos(flow_rad)) / meters_per_deg_lat
        toe_pt = [round(origin_lon + dx_f, 6), round(origin_lat + dy_f, 6)]

        # Left bank expansion
        rad_left = flow_rad - spread_half
        dx_l = (runout_length_m * math.sin(rad_left)) / meters_per_deg_lon
        dy_l = (runout_length_m * math.cos(rad_left)) / meters_per_deg_lat
        left_pt = [round(origin_lon + dx_l, 6), round(origin_lat + dy_l, 6)]

        polygon_coords = [[apex, right_pt, toe_pt, left_pt, apex]]

        return {
            "type": "Polygon",
            "coordinates": polygon_coords
        }
