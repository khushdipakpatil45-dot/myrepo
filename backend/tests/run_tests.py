import unittest
import asyncio
import sys
import os

# Add backend to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.ml.pinn.inference import GeotechnicalPINNInference
from app.ml.runout.dinfinity import DInfinityRouting
from app.ml.runout.voellmy import VoellmySalmSimulator
from app.services.osrm_service import OSRMService
from app.services.anti_spoofing import AntiSpoofingValidator
from app.services.ivrs_service import RegionalIVRSEngine
from app.services.sar_service import sar_service
from app.services.directions_service import directions_service
from app.schemas.route import Coordinates

class TestTerraCastPipeline(unittest.TestCase):

    def test_geotechnical_factor_of_safety(self):
        # Stable
        stable = GeotechnicalPINNInference.calculate_factor_of_safety(
            cohesion_kpa=22.0,
            internal_friction_deg=32.0,
            slope_angle_deg=35.0,
            soil_depth_m=3.0,
            pore_water_pressure_kpa=5.0
        )
        self.assertGreater(stable["factor_of_safety"], 1.30)
        self.assertEqual(stable["threat_tier"], "NORMAL")

        # Critical failure
        critical = GeotechnicalPINNInference.calculate_factor_of_safety(
            cohesion_kpa=12.0,
            internal_friction_deg=26.0,
            slope_angle_deg=48.0,
            soil_depth_m=4.5,
            pore_water_pressure_kpa=52.0
        )
        self.assertLessEqual(critical["factor_of_safety"], 1.00)
        self.assertEqual(critical["threat_tier"], "CRITICAL")
        self.assertGreaterEqual(critical["trigger_probability"], 0.90)

    def test_voellmy_salm_and_dinfinity_runout(self):
        voellmy = VoellmySalmSimulator()
        kinetics = voellmy.simulate_runout_kinetics(
            slip_volume_m3=4500.0,
            drop_height_m=280.0,
            slope_angle_deg=45.0,
            distance_to_road_m=220.0
        )
        self.assertTrue(kinetics["reaches_road"])
        self.assertGreater(kinetics["time_to_road_cutoff_mins"], 0)
        self.assertGreater(kinetics["peak_velocity_m_s"], 5.0)

        polygon = DInfinityRouting.generate_runout_polygon(
            origin_lat=26.9851,
            origin_lon=88.4612,
            runout_length_m=kinetics["max_runout_distance_m"],
            aspect_deg=180.0
        )
        self.assertEqual(polygon["type"], "Polygon")
        self.assertEqual(len(polygon["coordinates"][0]), 5)

    def test_dynamic_osrm_rerouting(self):
        async def run_routing():
            service = OSRMService()
            return await service.compute_bypass_route(
                origin=Coordinates(lat=26.7271, lon=88.3953),
                destination=Coordinates(lat=27.3389, lon=88.6065)
            )
        route = asyncio.run(run_routing())
        self.assertEqual(route.status, "PASSABLE")
        self.assertIn("Lava", route.recommended_route_name)
        self.assertIn("BLOCKED", route.standard_route_status)
        self.assertGreater(len(route.clearance_checkpoints), 0)

    def test_sar_heatmap_geojson_generation(self):
        async def run_sar():
            return await sar_service.fetch_sar_deformation_heatmap("NH-10")
        geojson = asyncio.run(run_sar())
        self.assertEqual(geojson["type"], "FeatureCollection")
        self.assertGreater(len(geojson["features"]), 0)
        first_feat = geojson["features"][0]
        self.assertIn("properties", first_feat)
        self.assertIn("threat_tier", first_feat["properties"])
        self.assertIn("los_velocity_mm_year", first_feat["properties"])
        self.assertEqual(first_feat["geometry"]["type"], "Polygon")

    def test_google_directions_safe_bypass(self):
        async def run_bypass():
            return await directions_service.calculate_safe_bypass(
                origin_lat=26.7271,
                origin_lon=88.3953,
                dest_lat=27.3389,
                dest_lon=88.6065,
                corridor_id="NH-10"
            )
        bypass = asyncio.run(run_bypass())
        self.assertEqual(bypass["status"], "SUCCESS")
        self.assertIn("Lava", bypass["summary"])
        self.assertGreater(len(bypass["checkpoints"]), 0)

    def test_anti_spoofing_validation(self):
        valid_report = AntiSpoofingValidator.validate_report(
            latitude=26.9851,
            longitude=88.4612,
            compass_azimuth_deg=190.0,
            slope_aspect_deg=185.0
        )
        self.assertEqual(valid_report["anti_spoofing_status"], "VALID")
        self.assertGreaterEqual(valid_report["confidence_score"], 0.90)

    def test_regional_ivrs_engine(self):
        khasi = RegionalIVRSEngine.generate_dispatch_payload("NH-10", "29th Mile", "Lava - Kalimpong", "khasi")
        self.assertIn("JINGMAH", khasi["title"])
        self.assertTrue(khasi["dispatched"])

        mizo = RegionalIVRSEngine.generate_dispatch_payload("NH-29", "Pagla Pahar", "Niuland", "mizo")
        self.assertIn("LEIMIN", mizo["title"])

if __name__ == '__main__':
    unittest.main(verbosity=2)
