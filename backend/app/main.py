from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import weather, analyze, virtual_try_on, qrcode
from app.utils.config import get_settings
from app.utils.logger import get_logger
from app.utils.exceptions import APIError
import time
import uvicorn

settings = get_settings()
logger = get_logger(__name__)

app = FastAPI(
    title="Moda Aynası API",
    description="Yapay zeka destekli kişisel moda asistanı API'si",
    version="1.0.0"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.BASE_URL],  # Sadece izin verilen origin
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Sadece gerekli metodlar
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(
        f"Method: {request.method} "
        f"Path: {request.url.path} "
        f"Status: {response.status_code} "
        f"Time: {process_time:.2f}s"
    )
    return response

# Global exception handler
@app.exception_handler(APIError)
async def api_error_handler(request: Request, exc: APIError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc)}
    )

# Routers
app.include_router(weather.router, prefix="/weather", tags=["weather"])
app.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
app.include_router(virtual_try_on.router, prefix="/virtual-try-on", tags=["virtual-try-on"])
app.include_router(qrcode.router, prefix="/qrcode", tags=["qrcode"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
