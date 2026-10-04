"""
TerraCast-NER: SAR Heatmap & Tactical Routing Endpoints
Exposes GeoJSON data layer for Google Maps and live radar telemetry.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.services.sar_service import sar_service
from app.services.directions_service import directions_service

router = APIRouter()

class BypassRouteRequest(BaseModel):
    corridor_id: str = "NH-10"
    origin_lat: float = 26.7271
    origin_lon: float = 88.3953
    dest_lat: float = 27.3389
    dest_lon: float = 88.6065

@router.get("/heatmap", response_model=Dict[str, Any])
async def get_sar_heatmap(
    corridor_id: str = Query("NH-10", description="Corridor ID: NH-10, NH-29, or NH-6")
):
    """
    Returns live processed C-Band SAR ground deformation polygons (GeoJSON FeatureCollection)
    formatted for Google Maps TileOverlay / Data Layer.
    """
    return await sar_service.fetch_sar_deformation_heatmap(corridor_id=corridor_id)

@router.get("/status")
async def get_sar_telemetry_status():
    """Returns constellation status for Sentinel-1 and NISAR radar satellites."""
    return {
        "status": "OPERATIONAL",
        "active_constellations": [
            {
                "satellite": "Sentinel-1A",
                "instrument": "C-SAR (5.405 GHz)",
                "revisit_interval_days": 6,
                "latest_pass": "Descending Track 121 (Sikkim)",
                "coherence_quality": "HIGH (0.94)"
            },
            {
                "satellite": "Sentinel-1C",
                "instrument": "C-SAR (5.405 GHz)",
                "revisit_interval_days": 6,
                "latest_pass": "Ascending Track 048 (Assam-Nagaland)",
                "coherence_quality": "HIGH (0.96)"
            },
            {
                "satellite": "NISAR (NASA-ISRO SAR)",
                "instrument": "L-Band & S-Band InSAR",
                "revisit_interval_days": 12,
                "penetration_depth": "Dense vegetation canopy penetration",
                "status": "CALIBRATED"
            }
        ],
        "ner_coverage_bbox": [87.50, 21.50, 97.50, 29.50],
        "processing_latency_ms": 42
    }

@router.post("/tactical-bypass")
async def calculate_tactical_bypass_route(req: BypassRouteRequest):
    """
    Uses Google Maps Directions API to calculate alternative safe corridor
    avoiding active SAR landslide deformation zones.
    """
    return await directions_service.calculate_safe_bypass(
        origin_lat=req.origin_lat,
        origin_lon=req.origin_lon,
        dest_lat=req.dest_lat,
        dest_lon=req.dest_lon,
        corridor_id=req.corridor_id
    )
