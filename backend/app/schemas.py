from pydantic import BaseModel
from typing import List, Optional

# Hava durumu verileri
class WeatherData(BaseModel):
    temperature: float
    description: str
    humidity: int
    wind_speed: float
    icon: str

# Ürün verileri
class ProductData(BaseModel):
    id: str
    name: str
    brand: str
    category: str
    price: float
    image_url: str
    description: Optional[str] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None

# Fotoğraf analizi isteği
class AnalyzeRequest(BaseModel):
    image: str  # base64 encoded image
    location: Optional[str] = None

# Fotoğraf analizi yanıtı
class AnalyzeResponse(BaseModel):
    style: str
    recommendations: List[ProductData]
    weather_data: Optional[WeatherData] = None

# Sanal deneme isteği
class VirtualTryOnRequest(BaseModel):
    user_image: str  # base64
    product_image: str  # base64 or url

# Sanal deneme yanıtı
class VirtualTryOnResponse(BaseModel):
    result_image: str  # base64
    success: bool
    message: Optional[str] = None

# QRCode isteği
class QRCodeRequest(BaseModel):
    product_id: str
    size: Optional[str] = None
    color: Optional[str] = None

# QRCode yanıtı
class QRCodeResponse(BaseModel):
    qr_token: str

# Hata yanıtı
class ErrorResponse(BaseModel):
    detail: str
    status_code: int = 400
