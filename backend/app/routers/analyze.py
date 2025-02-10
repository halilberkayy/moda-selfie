from fastapi import APIRouter, HTTPException
from app.schemas import AnalyzeRequest, AnalyzeResponse, ProductData
from app.services import deepfashion
from app.utils.logger import get_logger
from app.routers.weather import get_weather

router = APIRouter()
logger = get_logger(__name__)

@router.post("", response_model=AnalyzeResponse)
async def analyze_image(request: AnalyzeRequest):
    """Kıyafet fotoğrafını analiz eder ve öneriler sunar"""
    try:
        # Fotoğrafı analiz et
        style = deepfashion.analyze_style(request.image)
        
        # Önerileri al
        recommendations = deepfashion.get_recommendations(style)
        
        # Hava durumu bilgisini al (opsiyonel)
        weather_data = None
        if request.location:
            try:
                weather_data = await get_weather(request.location)
            except Exception as e:
                logger.warning(f"Hava durumu alınamadı: {str(e)}")
        
        return AnalyzeResponse(
            style=style,
            recommendations=recommendations,
            weather_data=weather_data
        )
        
    except Exception as e:
        logger.error(f"Fotoğraf analizi hatası: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Fotoğraf analizi sırasında bir hata oluştu"
        )
