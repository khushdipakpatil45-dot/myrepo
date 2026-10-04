from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class BoundingBox(BaseModel):
    min_lat: float = Field(..., ge=20.0, le=30.0)
    max_lat: float = Field(..., ge=20.0, le=30.0)
    min_lon: float = Field(..., ge=85.0, le=98.0)
    max_lon: float = Field(..., ge=85.0, le=98.0)

class HazardEvaluationRequest(BaseModel):
    corridor_id: str = Field(..., example="NH-10")
    bounding_box: BoundingBox
    rainfall_forecast_hours: int = Field(default=24, ge=1, le=72)
    include_runout_simulation: bool = Field(default=True)

class RunoutMetrics(BaseModel):
    time_to_road_cutoff_mins: int
    debris_volume_cubic_meters: float
    debris_deposition_depth_meters: float

class CriticalZoneOut(BaseModel):
    zone_id: UUID
    location_name: str
    chainage_km: float
    factor_of_safety: float
    threat_tier: str
    trigger_probability: float
    pore_water_pressure_kpa: float
    estimated_slip_depth_meters: float
    runout_metrics: Optional[RunoutMetrics] = None
    affected_road_geojson: dict

class CorridorSummary(BaseModel):
    total_length_km: float
    at_risk_length_km: float
    active_critical_points: int

class HazardEvaluationResponse(BaseModel):
    status: str
    evaluation_timestamp: datetime
    corridor: str
    summary: CorridorSummary
    critical_zones: List[CriticalZoneOut]
