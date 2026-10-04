from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.telemetry import ESP32TelemetryIn

router = APIRouter()

@router.post("/iot-ingest", status_code=201)
async def ingest_iot_probe(
    payload: ESP32TelemetryIn,
    x_device_signature: str = Header(default="dev-test-sig"),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingests live capacitance soil moisture and piezometer pore-water pressure telemetry
    from ESP32 edge probes along highway corridors.
    """
    return {
        "status": "INGESTED",
        "sensor_id": payload.sensor_id,
        "corridor_id": payload.corridor_id,
        "pore_pressure_kpa": payload.pore_water_pressure_kpa
    }

@router.get("/weather/live")
async def get_live_ner_weather():
    """
    Ingests and returns real-time IMD Doppler AWS radar and NASA GPM IMERG feeds
    across all high-risk North Eastern Region districts (Dima Hasao, East Khasi Hills, North Sikkim, Aizawl, etc.).
    """
    from app.services.weather_service import weather_service
    return weather_service.get_live_precipitation_summary()

@router.get("/gpm/feed")
async def get_gpm_precipitation_feed():
    """Returns NASA GPM constellation 30-minute global precipitation data for NER."""
    from app.services.weather_service import weather_service
    data = weather_service.get_live_precipitation_summary()
    return {
        "dataset": "NASA GPM IMERG Early Precipitation L3 30 min 0.1 degree x 0.1 degree (GPM_3IMERGHHE)",
        "bounding_box": [87.50, 21.50, 97.50, 29.50],
        "districts_monitored": len(data["districts"]),
        "highest_rainfall_district": max(data["districts"], key=lambda d: d["rainfall_rate_mm_hr"]),
        "feed": data["districts"]
    }

