import os
import uuid
import httpx
import numpy as np
import cv2
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File, HTTPException, Response, Form, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
import redis
from loguru import logger
import time
from typing import Optional, List
import asyncio
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine
import models
import qrcode
import io
import base64
from ast import literal_eval  # Güvenli string'den listeye dönüştürme için

load_dotenv()

# Uygulama yapılandırması
class AppConfig:
    MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
    REDIS_EXPIRY = 60  # saniye
    MAX_RETRIES = 3
    RETRY_DELAY = 1  # saniye

app = FastAPI(
    title="Akıllı Ayna Kiosk Sistemi API",
    description="API for Smart Mirror Kiosk System with Virtual Try On",
    version="1.0.0"
)

# Güvenlik middleware'leri
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])  # Production'da spesifik hostları belirtin

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Production'da spesifik originleri belirtin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

def validate_image(file: UploadFile) -> bool:
    if file.content_type not in AppConfig.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Sadece JPEG ve PNG formatları desteklenmektedir"
        )
    return True

@app.get("/")
def read_root():
    return {"message": "Akıllı Ayna Kiosk Sistemi API'ye hoş geldiniz!"}

@app.post("/api/kvkk-onay")
def kvkk_onay():
    logger.info("KVKK onay endpoint çağrıldı.")
    return {"status": "KVKK onaylandı", "timestamp": time.time()}

@app.post("/api/fotograf-yukle")
async def fotograf_yukle(file: UploadFile = File(...)):
    logger.info("Fotoğraf yükleme endpoint çağrıldı.")
    try:
        validate_image(file)
        contents = await file.read()
        
        if len(contents) > AppConfig.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Dosya boyutu {AppConfig.MAX_UPLOAD_SIZE/1024/1024}MB'dan küçük olmalıdır"
            )
        
        image_id = str(uuid.uuid4())
        redis_client.setex(
            f"image:{image_id}",
            AppConfig.REDIS_EXPIRY,
            contents
        )
        
        logger.info(f"Fotoğraf {image_id} ID ile yüklendi.")
        return {"image_id": image_id, "expiry": AppConfig.REDIS_EXPIRY}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Fotoğraf yüklenirken hata: {e}")
        raise HTTPException(status_code=500, detail="Fotoğraf yükleme başarısız.")

# Kling AI API için yardımcı fonksiyonlar
def generate_jwt_token():
    """
    Kling AI API için JWT token oluşturur
    """
    try:
        import jwt
        import time
        
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
        token = jwt.encode(payload, sk, headers=headers)
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

@app.post("/api/virtual-tryon")
async def virtual_try_on(file: UploadFile = File(...), clothing_type: Optional[str] = Form(None)):
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

@app.post("/urun-oner")
async def urun_oner(file: UploadFile = File(...), top_k: Optional[int] = Form(5)):
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
@app.post("/products/", response_model=models.ProductInDB)
async def create_product(product: models.ProductCreate, db: Session = Depends(get_db)):
    """Yeni ürün ekleme"""
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    try:
        db.commit()
        db.refresh(db_product)
        logger.info(f"Yeni ürün eklendi: {db_product.name}")
        return db_product
    except Exception as e:
        db.rollback()
        logger.error(f"Ürün eklenirken hata: {e}")
        raise HTTPException(status_code=500, detail="Ürün eklenemedi")

@app.get("/products/", response_model=List[models.ProductInDB])
async def list_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Ürünleri listele"""
    query = db.query(models.Product)
    
    if category:
        query = query.filter(models.Product.category == category)
    if brand:
        query = query.filter(models.Product.brand == brand)
    if active_only:
        query = query.filter(models.Product.is_active == True)
    
    products = query.offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}", response_model=models.ProductInDB)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Belirli bir ürünü getir"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return product

@app.put("/products/{product_id}", response_model=models.ProductInDB)
async def update_product(
    product_id: int,
    product_update: models.ProductUpdate,
    db: Session = Depends(get_db)
):
    """Ürün bilgilerini güncelle"""
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    
    for field, value in product_update.model_dump(exclude_unset=True).items():
        setattr(db_product, field, value)
    
    try:
        db.commit()
        db.refresh(db_product)
        logger.info(f"Ürün güncellendi: {db_product.name}")
        return db_product
    except Exception as e:
        db.rollback()
        logger.error(f"Ürün güncellenirken hata: {e}")
        raise HTTPException(status_code=500, detail="Ürün güncellenemedi")

@app.delete("/products/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Ürünü sil (soft delete)"""
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    
    db_product.is_active = False
    try:
        db.commit()
        logger.info(f"Ürün silindi: {db_product.name}")
        return {"message": "Ürün başarıyla silindi"}
    except Exception as e:
        db.rollback()
        logger.error(f"Ürün silinirken hata: {e}")
        raise HTTPException(status_code=500, detail="Ürün silinemedi")

@app.get("/categories/", response_model=List[str])
async def get_categories(db: Session = Depends(get_db)):
    """Mevcut kategorileri listele"""
    categories = db.query(models.Product.category).distinct().all()
    return [category[0] for category in categories if category[0]]

@app.get("/brands/", response_model=List[str])
async def get_brands(db: Session = Depends(get_db)):
    """Mevcut markaları listele"""
    brands = db.query(models.Product.brand).distinct().all()
    return [brand[0] for brand in brands if brand[0]]

@app.get("/health")
async def health_check():
    """Sağlık kontrolü endpoint'i"""
    try:
        # Redis bağlantısını kontrol et (senkron metodu asenkron hale getiriyoruz)
        await asyncio.to_thread(redis_client.ping)
        
        # Model durumunu kontrol et
        if not os.path.exists(MODEL_PATH):
            return JSONResponse(
                status_code=503,
                content={"status": "unhealthy", "detail": "AI model not loaded"}
            )
        
        return {"status": "healthy", "timestamp": time.time()}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "detail": str(e)}
        )

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
@app.get("/products/{product_id}/qr")
async def get_product_qr(product_id: int, db: Session = Depends(get_db)):
    """Ürün URL'si için QR kod oluştur"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    if not product.product_url:
        raise HTTPException(status_code=400, detail="Ürün URL'si bulunamadı")
    
    qr_code = generate_qr_code(product.product_url)
    return StreamingResponse(io.BytesIO(qr_code), media_type="image/png")

# Virtual try-on endpoint'i (QR kod ve ürün detayları ile)
@app.post("/virtual-try-on/")
async def virtual_try_on_with_qr(
    file: UploadFile = File(...),
    product_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """Virtual Try On with QR code response"""
    try:
        # Ürünü veritabanından al
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if product is None:
            raise HTTPException(status_code=404, detail="Ürün bulunamadı")

        # Dosyayı kontrol et
        validate_image(file)
        
        # Resmi oku
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Görüntü okunamadı")

        # Virtual try-on işlemini gerçekleştir
        result = await kling_api_request(
            "/v1.5/try-on",
            {
                "image": base64.b64encode(contents).decode(),
                "product_image": product.image_url,
                "category": product.category
            }
        )
        
        # QR kod oluştur
        qr_code = None
        if product.product_url:
            qr_code = base64.b64encode(generate_qr_code(product.product_url)).decode()
        
        return {
            "success": True,
            "try_on_image": result.get("result_image"),
            "product_url": product.product_url,
            "qr_code": qr_code,
            "product_details": {
                "name": product.name,
                "price": product.price,
                "currency": product.currency,
                "brand": product.brand
            }
        }
            
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Virtual try on hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Veritabanı tablolarını oluştur
models.Base.metadata.create_all(bind=engine)