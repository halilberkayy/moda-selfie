import os
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # OpenWeather API
    OPENWEATHER_API_KEY: str
    
    # Kolors (Virtual Try-On) API
    KOLORS_API_URL: str
    KOLORS_ACCESS_KEY: str
    KOLORS_SECRET_KEY: str
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    # Model
    MODEL_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), 
        "models", 
        "deepfashion_model.h5"
    )
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()
