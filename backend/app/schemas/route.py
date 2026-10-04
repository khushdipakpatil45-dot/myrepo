from pydantic import BaseModel, Field
from typing import List, Optional

class Coordinates(BaseModel):
    lat: float
    lon: float

class Checkpoint(BaseModel):
    checkpoint_name: str
    status: str

class SafeCorridorRequest(BaseModel):
    origin: Coordinates
    destination: Coordinates
    convoy_type: str = Field(default="NDRF_RESCUE_HEAVY")
    avoid_threat_tiers: List[str] = Field(default=["WARNING", "CRITICAL"])

class ConvoyRouteOut(BaseModel):
    route_id: str
    recommended_route_name: str
    status: str
    estimated_time_minutes: int
    distance_km: float
    standard_route_status: str
    clearance_checkpoints: List[Checkpoint]
    route_geometry: dict
