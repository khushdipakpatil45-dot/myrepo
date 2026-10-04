from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.services.sar_service import sar_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Physics-Informed Real-Time Landslide Early Warning & Safe Corridor API for North Eastern Region",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Direct root endpoint alias for SAR heatmap GeoJSON consumption
@app.get("/api/sar-heatmap", tags=["Synthetic Aperture Radar (SAR)"])
async def get_root_sar_heatmap(
    corridor_id: str = Query("NH-10", description="Lifeline corridor: NH-10, NH-29, or NH-6")
):
    """Direct root endpoint returning C-band SAR ground deformation GeoJSON for Google Maps."""
    return await sar_service.fetch_sar_deformation_heatmap(corridor_id=corridor_id)

@app.get("/healthz", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to TerraCast-NER API Gateway",
        "docs_url": "/docs",
        "health": "/healthz",
        "sar_heatmap": "/api/sar-heatmap"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
