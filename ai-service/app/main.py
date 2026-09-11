from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.routes import health, process, gemini, transcription
from app.core.config import settings
from app.utils.exceptions import GeminiServiceError

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(process.router, prefix="/api/v1", tags=["Process"])
app.include_router(gemini.router, prefix="/api/v1/gemini", tags=["Gemini"])
app.include_router(transcription.router, prefix="/api/v1/transcription", tags=["Transcription"])


@app.exception_handler(GeminiServiceError)
async def gemini_service_exception_handler(request: Request, exc: GeminiServiceError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "success": False,
            "error": exc.detail
        }
    )


@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "status": "running",
        "version": settings.APP_VERSION,
    }
