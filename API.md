# 📚 API Dokümantasyonu

## 🌐 Genel Bilgiler

- **Base URL**: `http://localhost:8000/api/v1`
- **Format**: Tüm istekler ve yanıtlar JSON formatındadır
- **Kimlik Doğrulama**: Bearer token kullanılmaktadır
- **Rate Limiting**: 100 istek/dakika
- **Versiyonlama**: URL'de v1, v2 şeklinde belirtilir

## 🔐 Kimlik Doğrulama

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "full_name": "string"
}
```

## 👕 Ürün Yönetimi

### Ürün Listesi
```http
GET /products
```

**Query Parameters:**
- `page` (integer, default: 1): Sayfa numarası
- `limit` (integer, default: 20): Sayfa başına ürün sayısı
- `category` (string, optional): Kategori filtresi
- `brand` (string, optional): Marka filtresi
- `sort` (string, optional): Sıralama (price_asc, price_desc, newest)

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": 0,
      "category": "string",
      "brand": "string",
      "images": ["string"],
      "stock": 0,
      "created_at": "string"
    }
  ],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

### Ürün Detayı
```http
GET /products/{id}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": 0,
  "category": "string",
  "brand": "string",
  "images": ["string"],
  "stock": 0,
  "specifications": {
    "size": "string",
    "color": "string",
    "material": "string"
  },
  "created_at": "string",
  "updated_at": "string"
}
```

### Yeni Ürün Ekleme
```http
POST /products
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": 0,
  "category": "string",
  "brand": "string",
  "images": ["string"],
  "stock": 0,
  "specifications": {
    "size": "string",
    "color": "string",
    "material": "string"
  }
}
```

## 🎭 Virtual Try-On

### Kıyafet Deneme
```http
POST /virtual-try-on
```

**Request Body:**
```json
{
  "user_image": "base64_string",
  "product_id": "string",
  "preferences": {
    "size": "string",
    "color": "string"
  }
}
```

**Response:**
```json
{
  "id": "string",
  "result_image": "base64_string",
  "processing_time": 0,
  "recommendations": [
    {
      "product_id": "string",
      "similarity_score": 0
    }
  ]
}
```

### Deneme Geçmişi
```http
GET /virtual-try-on/history
```

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20)

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "product": {
        "id": "string",
        "name": "string",
        "image": "string"
      },
      "result_image": "string",
      "created_at": "string"
    }
  ],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

## 📊 Analitik

### Kullanım İstatistikleri
```http
GET /analytics/usage
```

**Query Parameters:**
- `start_date` (string, format: YYYY-MM-DD)
- `end_date` (string, format: YYYY-MM-DD)

**Response:**
```json
{
  "total_tries": 0,
  "unique_users": 0,
  "popular_products": [
    {
      "product_id": "string",
      "try_count": 0
    }
  ],
  "average_try_time": 0
}
```

## 🛠️ Sistem

### Sağlık Kontrolü
```http
GET /health
```

**Response:**
```json
{
  "status": "string",
  "version": "string",
  "uptime": 0,
  "database_status": "string",
  "redis_status": "string"
}
```

## ⚠️ Hata Kodları

| Kod | Açıklama |
|-----|-----------|
| 400 | Bad Request - İstek formatı hatalı |
| 401 | Unauthorized - Kimlik doğrulama gerekli |
| 403 | Forbidden - Yetkisiz erişim |
| 404 | Not Found - Kaynak bulunamadı |
| 429 | Too Many Requests - Rate limit aşıldı |
| 500 | Internal Server Error - Sunucu hatası |

## 📝 Notlar

1. Tüm tarih/saat değerleri ISO 8601 formatında UTC olarak döner
2. Başarılı istekler 2xx, hatalar 4xx veya 5xx durum kodları ile döner
3. Rate limiting aşıldığında `X-RateLimit-Reset` header'ı ile bekleme süresi döner
4. Büyük boyutlu görüntüler için pre-signed URL kullanılmalıdır
5. Websocket bağlantıları için `/ws` endpoint'i kullanılır
