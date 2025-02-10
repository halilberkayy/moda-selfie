import qrcode
import base64
from io import BytesIO
from app.utils.logger import get_logger

logger = get_logger(__name__)

def generate_qr_token(product_id: str, size: str = None, color: str = None) -> str:
    """
    Ürün bilgilerine göre QR kod oluşturur ve base64 formatında döndürür.
    
    Args:
        product_id (str): Ürün ID'si
        size (str, optional): Ürün bedeni
        color (str, optional): Ürün rengi
        
    Returns:
        str: Base64 formatında QR kod
    """
    try:
        # QR kod içeriğini oluştur
        qr_data = {
            "product_id": product_id,
            "size": size,
            "color": color
        }
        qr_string = str(qr_data)
        
        # QR kod oluştur
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_string)
        qr.make(fit=True)

        # QR kodu PNG formatında oluştur
        img = qr.make_image(fill_color="black", back_color="white")
        
        # PNG'yi base64'e çevir
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        qr_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{qr_base64}"
        
    except Exception as e:
        logger.error(f"QR kod oluşturma hatası: {str(e)}")
        raise
