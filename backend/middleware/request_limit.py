from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import Response
from typing import Union
from loguru import logger
from datetime import datetime

class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_size: int = 10_000_000):  # 10MB default
        super().__init__(app)
        self.max_size = max_size
        logger.info(f"RequestSizeLimitMiddleware initialized with max_size: {self.max_size} bytes")

    async def dispatch(self, request: Request, call_next) -> Union[Response, dict]:
        try:
            if request.headers.get('content-length'):
                content_length = int(request.headers.get('content-length'))
                if content_length > self.max_size:
                    logger.warning(f"Request size ({content_length} bytes) exceeds limit of {self.max_size} bytes")
                    raise HTTPException(
                        status_code=413,
                        detail={
                            "error": "Request entity too large",
                            "max_size_mb": self.max_size / 1_000_000,
                            "received_size_mb": content_length / 1_000_000
                        }
                    )
                logger.debug(f"Request size check passed: {content_length} bytes")
            return await call_next(request)
        except ValueError as e:
            logger.error(f"Invalid content-length header: {e}")
            raise HTTPException(status_code=400, detail="Invalid content-length header")
        except Exception as e:
            logger.error(f"Unexpected error in request size middleware: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")
