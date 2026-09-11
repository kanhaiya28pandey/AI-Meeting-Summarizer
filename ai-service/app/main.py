from fastapi import FastAPI

from app.api.routes import health
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.include_router(health.router, prefix="/api", tags=["Health"])


@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "status": "running",
        "version": settings.APP_VERSION,
    }
