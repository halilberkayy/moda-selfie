from fastapi import APIRouter, HTTPException
from app.schemas import VirtualTryOnRequest, VirtualTryOnResponse
from app.services.kolors import KolorsService
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)
kolors_service = KolorsService()

@router.post("", response_model=VirtualTryOnResponse)
async def virtual_try_on(request: VirtualTryOnRequest):
    """Kullanıcı ve ürün fotoğraflarını kullanarak sanal deneme yapar"""
    try:
        result_image = await kolors_service.try_on(
            user_image=request.user_image,
            product_image=request.product_image
        )
        
        return VirtualTryOnResponse(
            result_image=result_image,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Sanal deneme hatası: {str(e)}")
        return VirtualTryOnResponse(
            result_image="",
            success=False,
            message=str(e)
        )
