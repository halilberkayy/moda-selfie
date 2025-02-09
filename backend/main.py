import os
import uuid
import httpx
import numpy as np
import cv2
import tensorflow as tf
import datetime
import json
import redis
import qrcode
import base64
import logging
import asyncio
from io import BytesIO
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, Request, HTTPException, Depends, status
from fastapi.responses import JSONResponse, Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from loguru import logger
from dotenv import load_dotenv
import time
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import models
import aiofiles
from ast import literal_eval  # Güvenli string'den listeye dönüştürme için
from middleware.security import SecurityHeadersMiddleware
from middleware.request_limit import RequestSizeLimitMiddleware
from middleware.validation import RequestValidationMiddleware
from jose import jwt

load_dotenv()

# Uygulama yapılandırması
class AppConfig:
    MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
    REDIS_EXPIRY = 60  # saniye
    MAX_RETRIES = 3
    RETRY_DELAY = 1  # saniye
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")

# Rate limiter yapılandırması
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="Akıllı Ayna Kiosk Sistemi API",
    description="API for Smart Mirror Kiosk System with Virtual Try On",
    version="1.0.0"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Güvenlik middleware'leri
app.add_middleware(TrustedHostMiddleware, allowed_hosts=AppConfig.ALLOWED_HOSTS)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestSizeLimitMiddleware, max_size=AppConfig.MAX_UPLOAD_SIZE)
app.add_middleware(RequestValidationMiddleware)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=AppConfig.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=3600,
)

# Loglama ayarı
logger.add(
    "logs/backend.log",
    rotation="10 MB",
    compression="zip",
    retention="30 days",
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
)

# Redis bağlantısı
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
REDIS_DB = int(os.getenv("REDIS_DB", 0))

redis_client = None
MAX_REDIS_RETRIES = 5
REDIS_RETRY_DELAY = 2

def init_redis():
    global redis_client
    for attempt in range(MAX_REDIS_RETRIES):
        try:
            redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                password=REDIS_PASSWORD,
                db=REDIS_DB,
                decode_responses=True,
                socket_timeout=5,
                socket_connect_timeout=5,
                retry_on_timeout=True
            )
            redis_client.ping()
            logger.info("Redis bağlantısı başarılı")
            return True
        except redis.ConnectionError as e:
            if attempt < MAX_REDIS_RETRIES - 1:
                logger.warning(f"Redis bağlantı denemesi {attempt + 1} başarısız: {str(e)}")
                time.sleep(REDIS_RETRY_DELAY)
            else:
                logger.error(f"Redis bağlantısı başarısız: {str(e)}")
                return False
        except Exception as e:
            logger.error(f"Redis bağlantısında beklenmeyen hata: {str(e)}")
            return False

# Redis bağlantısını başlat
init_redis()

# PostgreSQL bağlantı URL'si
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://smart_mirror:smart_mirror_password@db:5432/smart_mirror_db"
)

# SQLAlchemy engine ve session
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Yapay zeka modelini yükle
MODEL_PATH = "ai-model/deepfashion_model.h5"

def create_deepfashion_model():
    """Yeni bir DeepFashion modeli oluştur"""
    base_model = tf.keras.applications.ResNet50(
        include_top=False,
        weights='imagenet',
        input_shape=(224, 224, 3)
    )
    
    # Base model'i dondur
    base_model.trainable = False
    
    model = tf.keras.Sequential([
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dense(512, activation='relu'),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(46, activation='softmax')  # DeepFashion kategorileri
    ])
    
    return model

try:
    # Önce var olan modeli yüklemeyi dene
    try:
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH, compile=False)
            logger.info("Mevcut DeepFashion modeli başarıyla yüklendi")
        else:
            raise FileNotFoundError("Model dosyası bulunamadı")
    except Exception as load_error:
        logger.warning(f"Mevcut model yüklenemedi: {load_error}")
        logger.info("Yeni model oluşturuluyor...")
        
        # Yeni model oluştur
        model = create_deepfashion_model()
        
        # Modeli kaydet
        model.save(MODEL_PATH, save_format='h5')
        logger.info("Yeni DeepFashion modeli oluşturuldu ve kaydedildi")
    
except Exception as e:
    logger.error(f"Model yükleme/oluşturma hatası: {e}")
    model = None

# Middleware: Request ID ekleme
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    logger.bind(request_id=request_id).info(f"Request başladı: {request.method} {request.url}")
    start_time = time.time()
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.bind(request_id=request_id).info(f"Request tamamlandı: {process_time:.2f} saniye")
        return response
    except Exception as e:
        logger.bind(request_id=request_id).error(f"Request hatası: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred"}
    )

# Custom HTTPException handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP error {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Validation exception handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )

def validate_image(file: UploadFile) -> bool:
    if file.content_type not in AppConfig.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Sadece JPEG ve PNG formatları desteklenmektedir"
        )
    return True

@app.get("/")
@limiter.limit("10/minute")
async def read_root(request: Request):
    return {"message": "Akıllı Ayna Kiosk Sistemi API'ye hoş geldiniz!"}

@app.post("/api/kvkk-onay")
async def kvkk_onay():
    logger.info("KVKK onay endpoint çağrıldı.")
    return {"status": "KVKK onaylandı", "timestamp": time.time()}

@app.post("/api/fotograf-yukle")
@limiter.limit("5/minute")
async def fotograf_yukle(request: Request, file: UploadFile = File(...)):
    """
    Fotoğraf yükleme endpoint'i
    """
    try:
        # Dosya boyutu kontrolü
        if not await validate_image(file):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Geçersiz dosya formatı veya boyutu"
            )

        # Benzersiz dosya adı oluştur
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Dosyayı kaydet
        file_path = os.path.join("uploads", unique_filename)
        os.makedirs("uploads", exist_ok=True)
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "message": "Fotoğraf başarıyla yüklendi",
                "filename": unique_filename
            }
        )

    except Exception as e:
        logger.error(f"Fotoğraf yükleme hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Fotoğraf yüklenirken bir hata oluştu"
        )

# Kling AI API için yardımcı fonksiyonlar
def generate_jwt_token():
    """
    Kling AI API için JWT token oluşturur
    """
    try:
        ak = os.getenv("KLING_ACCESS_KEY")
        sk = os.getenv("KLING_SECRET_KEY")
        
        if not ak or not sk:
            logger.error("Kling API anahtarları bulunamadı")
            raise ValueError("API anahtarları eksik")
            
        headers = {
            "alg": "HS256",
            "typ": "JWT"
        }
        payload = {
            "iss": ak,
            "exp": int(time.time()) + 1800,
            "nbf": int(time.time()) - 5
        }
        token = jwt.encode(payload, sk, headers=headers, algorithm="HS256")
        return token
    except Exception as e:
        logger.error(f"JWT token oluşturma hatası: {e}")
        raise

async def kling_api_request(endpoint: str, data: dict, method: str = "POST", files: dict = None):
    """
    Kling AI API'ye istek gönderen genel fonksiyon
    """
    try:
        token = generate_jwt_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        base_url = "https://api.klingai.com"
        url = f"{base_url}{endpoint}"
        
        for attempt in range(AppConfig.MAX_RETRIES):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    if method == "POST":
                        if files:
                            response = await client.post(url, headers=headers, files=files)
                        else:
                            response = await client.post(url, headers=headers, json=data)
                    elif method == "GET":
                        response = await client.get(url, headers=headers, params=data)
                    
                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 429:  # Rate limit
                        if attempt < AppConfig.MAX_RETRIES - 1:
                            await asyncio.sleep(AppConfig.RETRY_DELAY * (attempt + 1))
                            continue
                    else:
                        logger.error(f"Kling API hatası: {response.text}")
                        raise HTTPException(
                            status_code=response.status_code,
                            detail=f"Kling API hatası: {response.text}"
                        )
            except httpx.TimeoutException:
                if attempt < AppConfig.MAX_RETRIES - 1:
                    await asyncio.sleep(AppConfig.RETRY_DELAY * (attempt + 1))
                    continue
                raise HTTPException(status_code=504, detail="API zaman aşımı")
                
        raise HTTPException(status_code=500, detail="Maksimum deneme sayısına ulaşıldı")
    except Exception as e:
        logger.error(f"Kling API isteği hatası: {e}")
        raise

@app.post("/api/virtual-try-on")
@limiter.limit("5/minute")
async def virtual_try_on(request: Request, file: UploadFile = File(...), clothing_type: Optional[str] = Form(None)):
    """
    Virtual Try On using Kling AI API V1.5
    """
    logger.info("Virtual try on isteği başladı")
    try:
        validate_image(file)
        contents = await file.read()
        
        # Base64'e çevir
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        data = {
            "model_name": "kling-v1-5",  # V1.5 modeli kullan
            "image": image_base64
        }
        
        if clothing_type:
            data["clothing_type"] = clothing_type
            
        result = await kling_api_request("/v1/kolors-virtual-try-on", data)
        
        # Sonuç URL'sini al
        if "task_result" in result.get("data", {}) and "images" in result["data"]["task_result"]:
            image_url = result["data"]["task_result"]["images"][0]["url"]
            
            # URL'den görüntüyü indir
            async with httpx.AsyncClient() as client:
                img_response = await client.get(image_url)
                if img_response.status_code == 200:
                    return Response(content=img_response.content, media_type="image/jpeg")
                    
        raise HTTPException(status_code=500, detail="Virtual try on sonucu alınamadı")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Virtual try on hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Ürün önerme sistemi için yardımcı fonksiyonlar
def get_product_features(image_array):
    """
    Görüntüden ürün özelliklerini çıkaran fonksiyon
    """
    if model is None:
        raise HTTPException(status_code=500, detail="AI modeli yüklenemedi")
    
    # Görüntüyü model için hazırla
    processed_image = cv2.resize(image_array, (224, 224))
    processed_image = processed_image / 255.0
    processed_image = np.expand_dims(processed_image, axis=0)
    
    # Model tahminini al
    features = model.predict(processed_image)
    return features

def get_similar_products(features, top_k=5):
    """
    Benzer ürünleri bulan fonksiyon
    """
    try:
        # Redis'ten benzer ürünleri al
        cache_key = f"similar_products_{hash(str(features))}"
        cached_results = redis_client.get(cache_key)
        
        if cached_results:
            return literal_eval(cached_results)
        
        # Örnek ürün veritabanı (gerçek uygulamada veritabanından gelecek)
        sample_products = [
            {"id": 1, "name": "Klasik Beyaz Gömlek", "price": 299.99, "category": "gömlek"},
            {"id": 2, "name": "Siyah Basic T-shirt", "price": 149.99, "category": "t-shirt"},
            {"id": 3, "name": "Slim Fit Jean", "price": 399.99, "category": "pantolon"},
            {"id": 4, "name": "Oversize Sweatshirt", "price": 249.99, "category": "sweatshirt"},
            {"id": 5, "name": "Deri Ceket", "price": 899.99, "category": "ceket"}
        ]
        
        # Sonuçları cache'le
        redis_client.setex(
            cache_key,
            AppConfig.REDIS_EXPIRY,
            str(sample_products[:top_k])
        )
        
        return sample_products[:top_k]
    except Exception as e:
        logger.error(f"Benzer ürünler bulunurken hata: {e}")
        raise HTTPException(status_code=500, detail="Ürün önerileri alınamadı")

@app.post("/api/urun-oner")
@limiter.limit("5/minute")
async def urun_oner(request: Request, file: UploadFile = File(...), top_k: Optional[int] = Form(5)):
    """
    Yüklenen fotoğrafa benzer ürünleri önerir
    """
    try:
        # Görüntü doğrulama
        validate_image(file)
        
        # Görüntüyü oku
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Görüntü okunamadı")
        
        # Görüntüden özellikleri çıkar
        features = get_product_features(image)
        
        # Benzer ürünleri bul
        similar_products = get_similar_products(features, top_k)
        
        return {
            "success": True,
            "message": "Ürün önerileri başarıyla getirildi",
            "products": similar_products
        }
        
    except Exception as e:
        logger.error(f"Ürün önerme hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Ürün yönetimi endpoint'leri
@app.post("/api/products/", response_model=models.ProductInDB)
@limiter.limit("5/minute")
async def create_product(request: Request, product: models.ProductCreate, db: Session = Depends(get_db)):
    """
    Yeni ürün oluşturma endpoint'i
    """
    try:
        db_product = crud.create_product(db=db, product=product)
        return db_product
    except Exception as e:
        logger.error(f"Ürün oluşturma hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ürün oluşturulurken bir hata oluştu"
        )

@app.get("/api/products/", response_model=List[models.ProductInDB])
@limiter.limit("60/minute")
async def list_products(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Tüm ürünleri listele"""
    query = db.query(models.Product)
    
    # Aktif ürünleri getir
    query = query.filter(models.Product.is_active == True)
    
    # Stokta olan ürünleri getir
    query = query.filter(models.Product.stock > 0)
    
    # Sıralama
    query = query.order_by(models.Product.created_at.desc())
    
    products = query.offset(skip).limit(limit).all()
    return products

@app.get("/api/products/{product_id}", response_model=models.ProductInDB)
@limiter.limit("60/minute")
async def get_product(request: Request, product_id: int, db: Session = Depends(get_db)):
    """Belirli bir ürünü getir"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return product

@app.put("/api/products/{product_id}", response_model=models.ProductInDB)
@limiter.limit("10/minute")
async def update_product(
    request: Request,
    product_id: int,
    product: models.ProductUpdate,
    db: Session = Depends(get_db)
):
    """Ürün güncelleme"""
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    try:
        # Sadece güncellenen alanları değiştir
        for field, value in product.model_dump(exclude_unset=True).items():
            setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        logger.info(f"Ürün güncellendi: {db_product.name}")
        return db_product
    except Exception as e:
        db.rollback()
        logger.error(f"Ürün güncellenirken hata: {e}")
        raise HTTPException(status_code=500, detail="Ürün güncellenemedi")

@app.delete("/api/products/{product_id}")
@limiter.limit("10/minute")
async def delete_product(request: Request, product_id: int, db: Session = Depends(get_db)):
    """Ürün silme"""
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    try:
        db.delete(db_product)
        db.commit()
        logger.info(f"Ürün silindi: {db_product.name}")
        return {"message": "Ürün başarıyla silindi"}
    except Exception as e:
        db.rollback()
        logger.error(f"Ürün silinirken hata: {e}")
        raise HTTPException(status_code=500, detail="Ürün silinemedi")

@app.get("/categories/", response_model=List[str])
@limiter.limit("60/minute")
async def get_categories(request: Request, db: Session = Depends(get_db)):
    """Mevcut kategorileri listele"""
    categories = db.query(models.Product.category).distinct().all()
    return [category[0] for category in categories if category[0]]

@app.get("/brands/", response_model=List[str])
@limiter.limit("60/minute")
async def get_brands(request: Request, db: Session = Depends(get_db)):
    """Mevcut markaları listele"""
    brands = db.query(models.Product.brand).distinct().all()
    return [brand[0] for brand in brands if brand[0]]

@app.get("/health")
@limiter.limit("60/minute")
async def health_check(request: Request):
    health_status = {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "components": {
            "database": "healthy",
            "redis": "healthy",
            "ai_model": "healthy"
        }
    }
    
    try:
        # Database check
        db = next(get_db())
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status["components"]["database"] = "unhealthy"
        health_status["status"] = "unhealthy"
    
    try:
        # Redis check
        redis_client.ping()
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        health_status["components"]["redis"] = "unhealthy"
        health_status["status"] = "unhealthy"
    
    try:
        # AI model check
        if not os.path.exists(MODEL_PATH):
            raise Exception("AI model not found")
    except Exception as e:
        logger.error(f"AI model health check failed: {e}")
        health_status["components"]["ai_model"] = "unhealthy"
        health_status["status"] = "unhealthy"
    
    status_code = status.HTTP_200_OK if health_status["status"] == "healthy" else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(content=health_status, status_code=status_code)

# QR kod oluşturma yardımcı fonksiyonu
def generate_qr_code(url: str) -> bytes:
    """URL için QR kod oluştur"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()

# QR kod endpoint'i
@app.get("/api/products/{product_id}/qr")
@limiter.limit("60/minute")
async def get_product_qr(request: Request, product_id: int, db: Session = Depends(get_db)):
    """Ürün QR kodu oluştur"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(f"http://localhost:3000/products/{product_id}")
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        # BytesIO nesnesine kaydet
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        return StreamingResponse(img_bytes, media_type="image/png")
    except Exception as e:
        logger.error(f"QR kod oluşturma hatası: {e}")
        raise HTTPException(status_code=500, detail="QR kod oluşturulamadı")

# Virtual try-on endpoint'i (QR kod ve ürün detayları ile)
@app.post("/api/virtual-try-on/qr/")
@limiter.limit("10/minute")
async def virtual_try_on_with_qr(
    request: Request,
    product_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Virtual try-on endpoint'i (QR kod ve ürün detayları ile)
    """
    # Ürünü kontrol et
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    try:
        # Kullanıcı fotoğrafını işle
        contents = await image.read()
        user_image = Image.open(BytesIO(contents))
        
        # Virtual try-on işlemini gerçekleştir
        result_image = perform_virtual_tryon(user_image, product.image_url)
        
        # QR kodu oluştur
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(f"http://localhost:3000/products/{product_id}")
        qr.make(fit=True)
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Sonuç görüntüsünü ve QR kodu birleştir
        final_image = Image.new('RGB', (result_image.width + qr_image.width + 10, max(result_image.height, qr_image.height)))
        final_image.paste(result_image, (0, 0))
        final_image.paste(qr_image, (result_image.width + 10, 0))
        
        # Sonucu BytesIO'ya kaydet
        img_byte_arr = BytesIO()
        final_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(img_byte_arr, media_type="image/png")
    except Exception as e:
        logger.error(f"Virtual try-on hatası: {e}")
        raise HTTPException(status_code=500, detail="Virtual try-on işlemi başarısız oldu")

# Veritabanı tablolarını oluştur
models.Base.metadata.create_all(bind=engine)