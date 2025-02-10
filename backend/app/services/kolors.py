import aiohttp
from app.utils.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()

class KolorsService:
    def __init__(self):
        self.api_url = settings.KOLORS_API_URL
        self.access_key = settings.KOLORS_ACCESS_KEY
        self.secret_key = settings.KOLORS_SECRET_KEY
        
    async def try_on(self, user_image: str, product_image: str) -> str:
        """
        Kolors API'sini kullanarak sanal deneme yapar.
        
        Args:
            user_image (str): Base64 formatında kullanıcı fotoğrafı
            product_image (str): Base64 formatında ürün fotoğrafı
            
        Returns:
            str: Base64 formatında sonuç fotoğrafı
        """
        try:
            headers = {
                "x-api-key": self.access_key,
                "x-api-secret": self.secret_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "user_image": user_image,
                "product_image": product_image
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Kolors API hatası: {error_text}")
                        raise Exception("Sanal deneme başarısız oldu")
                        
                    result = await response.json()
                    return result["result_image"]
                    
        except aiohttp.ClientError as e:
            logger.error(f"Kolors API bağlantı hatası: {str(e)}")
            raise Exception("Kolors API'ye bağlanılamadı")
            
        except Exception as e:
            logger.error(f"Beklenmeyen hata: {str(e)}")
            raise
