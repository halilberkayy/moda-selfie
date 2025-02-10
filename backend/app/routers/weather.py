from fastapi import APIRouter, HTTPException
import requests
from app.utils.config import get_settings
from app.schemas import WeatherData
from app.utils.logger import get_logger

router = APIRouter()
settings = get_settings()
logger = get_logger(__name__)

@router.get("", response_model=WeatherData)
async def get_weather(location: str):
    """Belirtilen konum için hava durumu bilgisini getirir"""
    try:
        # Önce konum bilgisini koordinatlara çevirelim
        geocoding_url = f"http://api.openweathermap.org/geo/1.0/direct?q={location}&limit=1&appid={settings.OPENWEATHER_API_KEY}"
        geo_response = requests.get(geocoding_url)
        geo_response.raise_for_status()
        
        geo_data = geo_response.json()
        if not geo_data:
            raise HTTPException(status_code=404, detail=f"Konum bulunamadı: {location}")
        
        lat, lon = geo_data[0]["lat"], geo_data[0]["lon"]
        
        # Şimdi hava durumu bilgisini alalım
        weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={settings.OPENWEATHER_API_KEY}"
        weather_response = requests.get(weather_url)
        weather_response.raise_for_status()
        
        data = weather_response.json()
        
        return WeatherData(
            temperature=data["main"]["temp"],
            description=data["weather"][0]["description"],
            humidity=data["main"]["humidity"],
            wind_speed=data["wind"]["speed"],
            icon=data["weather"][0]["icon"]
        )
        
    except requests.RequestException as e:
        logger.error(f"OpenWeather API hatası: {str(e)}")
        raise HTTPException(status_code=500, detail="Hava durumu verisi alınamadı")
    except Exception as e:
        logger.error(f"Beklenmeyen hata: {str(e)}")
        raise HTTPException(status_code=500, detail="Sistem hatası")
