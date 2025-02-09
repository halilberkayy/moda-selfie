from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import re

class RequestValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Validate path parameters
        path = request.url.path
        if not self._is_safe_path(path):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid characters in request path"
            )

        # Validate query parameters
        query_params = request.query_params
        for key, value in query_params.items():
            if not self._is_safe_string(key) or not self._is_safe_string(value):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid characters in query parameters"
                )

        return await call_next(request)

    def _is_safe_path(self, path: str) -> bool:
        # Allow only alphanumeric characters, hyphen, underscore, and forward slash
        return bool(re.match(r'^[a-zA-Z0-9\-_/]+$', path))

    def _is_safe_string(self, value: str) -> bool:
        # Allow only printable ASCII characters, excluding special characters
        return bool(re.match(r'^[\x20-\x7E]+$', value) and not re.search(r'[<>\'"]', value))
