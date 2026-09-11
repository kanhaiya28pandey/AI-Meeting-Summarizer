import logging
import re
import uuid
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.routes import health, process, gemini, transcription, analyze
from app.core.config import settings
from app.utils.exceptions import GeminiServiceError

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

SAFE_REQUEST_ID_REGEX = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    client_req_id = request.headers.get("X-Request-ID")
    if client_req_id and SAFE_REQUEST_ID_REGEX.match(client_req_id.strip()):
        request_id = client_req_id.strip()
    else:
        request_id = uuid.uuid4().hex

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response


app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(process.router, prefix="/api/v1", tags=["Process"])
app.include_router(gemini.router, prefix="/api/v1/gemini", tags=["Gemini"])
app.include_router(transcription.router, prefix="/api/v1/transcription", tags=["Transcription"])
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["Analysis"])


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


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception processing %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred in AI service.",
            "success": False
        }
    )


@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "status": "running",
        "version": settings.APP_VERSION,
    }
