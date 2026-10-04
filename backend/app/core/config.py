from typing import List, Union
try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings  # type: ignore
    except ImportError:
        class BaseSettings:  # type: ignore
            pass

class Settings(BaseSettings):
    PROJECT_NAME: str = "TerraCast-NER Engine"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "terracast-super-secure-production-key-change-in-prod-32bytes"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://terracast.ner.gov.in"
    ]

    # Google Maps Platform
    GOOGLE_MAPS_API_KEY: str = ""

    # Live Synthetic Aperture Radar (SAR) Providers (Sentinel Hub & Copernicus)
    SENTINEL_HUB_CLIENT_ID: str = ""
    SENTINEL_HUB_CLIENT_SECRET: str = ""
    SENTINEL_HUB_INSTANCE_ID: str = ""
    SENTINEL_HUB_OAUTH_URL: str = "https://services.sentinel-hub.com/oauth/token"
    SENTINEL_HUB_PROCESS_URL: str = "https://services.sentinel-hub.com/api/v1/process"
    COPERNICUS_API_KEY: str = ""
    COPERNICUS_ODATA_URL: str = "https://catalogue.dataspace.copernicus.eu/odata/v1"

    # Supabase & Database
    SUPABASE_URL: str = "https://your-project-id.supabase.co"
    SUPABASE_KEY: str = "your-anon-or-service-key"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Routing
    OSRM_BACKEND_URL: str = "http://localhost:5000"

    # Telephony
    TELECOM_SIP_GATEWAY_URL: str = "https://api.exotel.com/v1"
    TELECOM_API_KEY: str = "test-api-key"
    TELECOM_API_SECRET: str = "test-api-secret"
    EMERGENCY_DISPATCH_CLI: str = "08047190000"
    CDN_STATIC_URL: str = "https://your-project-id.supabase.co/storage/v1/object/public"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
