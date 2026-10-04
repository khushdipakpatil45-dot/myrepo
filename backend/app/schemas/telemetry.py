from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ESP32TelemetryIn(BaseModel):
    sensor_id: str = Field(..., example="ESP32-NH10-KM29")
    corridor_id: str = Field(..., example="NH-10")
    timestamp: Optional[datetime] = None
    volumetric_water_content_30cm: float
    volumetric_water_content_60cm: float
    volumetric_water_content_120cm: Optional[float] = None
    pore_water_pressure_kpa: float
    battery_millivolts: int
    latitude: float
    longitude: float

class RainfallRecordIn(BaseModel):
    grid_cell_id: str
    source: str = "IMD_GRIDDED"
    precipitation_mm_hour: float
    accumulated_24h_mm: Optional[float] = None
    polygon_coordinates: list
