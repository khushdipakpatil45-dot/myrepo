import pytest
from app.ml.pinn.inference import GeotechnicalPINNInference
from app.ml.runout.dinfinity import DInfinityRouting
from app.ml.runout.voellmy import VoellmySalmSimulator
from app.services.osrm_service import OSRMService
from app.services.anti_spoofing import AntiSpoofingValidator
from app.services.ivrs_service import RegionalIVRSEngine
from app.schemas.route import Coordinates

def test_geotechnical_factor_of_safety():
    # 1. Normal Stable Slope under low pore pressure
    stable_result = GeotechnicalPINNInference.calculate_factor_of_safety(
        cohesion_kpa=22.0,
        internal_friction_deg=32.0,
        slope_angle_deg=35.0,
        soil_depth_m=3.0,
        pore_water_pressure_kpa=5.0
    )
    assert stable_result["factor_of_safety"] > 1.30
    assert stable_result["threat_tier"] == "NORMAL"

    # 2. Critical Slope under monsoon pore water pressure surge
    critical_result = GeotechnicalPINNInference.calculate_factor_of_safety(
        cohesion_kpa=12.0,
        internal_friction_deg=26.0,
        slope_angle_deg=48.0,
        soil_depth_m=4.5,
        pore_water_pressure_kpa=52.0
    )
    assert critical_result["factor_of_safety"] <= 1.00
    assert critical_result["threat_tier"] == "CRITICAL"
    assert critical_result["trigger_probability"] >= 0.90

def test_voellmy_salm_and_dinfinity_runout():
    voellmy = VoellmySalmSimulator()
    kinetics = voellmy.simulate_runout_kinetics(
        slip_volume_m3=4500.0,
        drop_height_m=280.0,
        slope_angle_deg=45.0,
        distance_to_road_m=220.0
    )
    assert kinetics["reaches_road"] is True
    assert kinetics["time_to_road_cutoff_mins"] > 0
    assert kinetics["peak_velocity_m_s"] > 5.0

    polygon = DInfinityRouting.generate_runout_polygon(
        origin_lat=26.9851,
        origin_lon=88.4612,
        runout_length_m=kinetics["max_runout_distance_m"],
        aspect_deg=180.0
    )
    assert polygon["type"] == "Polygon"
    assert len(polygon["coordinates"][0]) == 5

@pytest.mark.asyncio
async def test_dynamic_osrm_rerouting():
    service = OSRMService()
    route = await service.compute_bypass_route(
        origin=Coordinates(lat=26.7271, lon=88.3953),
        destination=Coordinates(lat=27.3389, lon=88.6065)
    )
    assert route.status == "PASSABLE"
    assert "Lava" in route.recommended_route_name
    assert "BLOCKED" in route.standard_route_status
    assert len(route.clearance_checkpoints) > 0

def test_anti_spoofing_validation():
    # Valid report with aligned azimuth
    valid_report = AntiSpoofingValidator.validate_report(
        latitude=26.9851,
        longitude=88.4612,
        compass_azimuth_deg=190.0,
        slope_aspect_deg=185.0
    )
    assert valid_report["anti_spoofing_status"] == "VALID"
    assert valid_report["confidence_score"] >= 0.90

def test_regional_ivrs_engine():
    dispatch_khasi = RegionalIVRSEngine.generate_dispatch_payload(
        corridor_id="NH-10",
        location="29th Mile",
        bypass_name="Lava - Kalimpong",
        language="khasi"
    )
    assert "JINGMAH" in dispatch_khasi["title"]
    assert dispatch_khasi["dispatched"] is True

    dispatch_mizo = RegionalIVRSEngine.generate_dispatch_payload(
        corridor_id="NH-29",
        location="Pagla Pahar",
        bypass_name="Niuland",
        language="mizo"
    )
    assert "LEIMIN" in dispatch_mizo["title"]
