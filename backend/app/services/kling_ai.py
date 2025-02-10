import os
import time
import jwt
import requests
import aiohttp
from app.schemas import VirtualTryOnResponse
from app.utils.config import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)

KOLORS_API_URL = os.getenv("KOLORS_API_URL")
KOLORS_ACCESS_KEY = os.getenv("KOLORS_ACCESS_KEY")
KOLORS_SECRET_KEY = os.getenv("KOLORS_SECRET_KEY")

def generate_kolors_api_token():
    """Kolors API için JWT token."""
    headers = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "iss": KOLORS_ACCESS_KEY,
        "exp": int(time.time()) + 1800,  # 30 dk
        "nbf": int(time.time()) - 5
    }
    token = jwt.encode(payload, KOLORS_SECRET_KEY, algorithm="HS256", headers=headers)
    return token

def virtual_try_on(payload: dict) -> VirtualTryOnResponse:
    url = f"{KOLORS_API_URL}/v1/images/kolors-virtual-try-on"
    token = generate_kolors_api_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Kolors Virtual Try-On API hatası {response.status_code}: {response.text}")
    data = response.json().get("data", {})
    return VirtualTryOnResponse(virtual_image_url=data.get("virtual_image_url", ""))

class KlingAIService:
    def __init__(self):
        self.api_url = settings.KOLORS_API_URL
        self.access_key = settings.KOLORS_ACCESS_KEY
        self.secret_key = settings.KOLORS_SECRET_KEY

    async def generate_virtual_try_on(self, human_image: str, cloth_image: str) -> dict:
        """
        Kolors AI API'sini kullanarak virtual try-on işlemi gerçekleştirir.
        
        Args:
            human_image (str): Base64 formatında kullanıcı fotoğrafı
            cloth_image (str): Giysi fotoğrafının URL'i
            
        Returns:
            dict: Virtual try-on sonucu
        """
        try:
            headers = {
                "x-api-key": self.access_key,
                "x-api-secret": self.secret_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "model_name": "kolors-virtual-try-on-v1",
                "human_image": human_image,
                "cloth_image": cloth_image
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_url}/virtual-try-on",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status != 200:
                        error_data = await response.json()
                        logger.error(f"Kolors API error: {error_data}")
                        raise Exception(f"Kolors API error: {error_data.get('message', 'Unknown error')}")
                    
                    result = await response.json()
                    return result

        except Exception as e:
            logger.error(f"Virtual try-on generation error: {str(e)}")
            raise Exception(f"Virtual try-on generation failed: {str(e)}")
