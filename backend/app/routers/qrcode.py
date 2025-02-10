from fastapi import APIRouter, HTTPException
from app.schemas import QRCodeRequest, QRCodeResponse
from app.services import qr_generator
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.post("", response_model=QRCodeResponse)
async def generate_qr(request: QRCodeRequest):
    """Ürün bilgilerine göre QR kod oluşturur"""
    try:
        qr_token = qr_generator.generate_qr_token(
            product_id=request.product_id,
            size=request.size,
            color=request.color
        )
        return QRCodeResponse(qr_token=qr_token)
    except Exception as e:
        logger.error(f"QR kod oluşturma hatası: {str(e)}")
        raise HTTPException(status_code=500, detail="QR kod oluşturulamadı")
