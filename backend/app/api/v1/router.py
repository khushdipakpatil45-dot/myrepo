from fastapi import APIRouter
from app.api.v1.endpoints import hazard, routes, telemetry, field_reports, sar

api_router = APIRouter()
api_router.include_router(hazard.router, prefix="/hazard", tags=["Hazard Modeling"])
api_router.include_router(routes.router, prefix="/routes", tags=["Safe Corridor Routing"])
api_router.include_router(telemetry.router, prefix="/telemetry", tags=["IoT Telemetry"])
api_router.include_router(field_reports.router, prefix="/field-reports", tags=["Field Reports"])
api_router.include_router(sar.router, prefix="/sar", tags=["Synthetic Aperture Radar (SAR)"])
