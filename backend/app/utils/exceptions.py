from fastapi import HTTPException

class APIError(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class RateLimitError(APIError):
    def __init__(self):
        super().__init__(
            status_code=429,
            detail="Rate limit exceeded. Please try again later."
        )

class AuthenticationError(APIError):
    def __init__(self):
        super().__init__(
            status_code=401,
            detail="Authentication failed"
        )

class ValidationError(APIError):
    def __init__(self, detail: str):
        super().__init__(
            status_code=400,
            detail=detail
        )
