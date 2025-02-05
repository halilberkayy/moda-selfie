# Moda Selfie Aynası - Backend 🖥️

Bu repo, Moda Selfie Aynası projesinin backend kısmını içerir. Hava durumu analizi, fotoğraf işleme ve ürün önerileri gibi temel servisleri sağlar.

## 🌟 Özellikler

- **🌤️ Hava Durumu Servisi**
  - OpenWeatherMap API entegrasyonu
  - Önbellek mekanizması
  - Hata yönetimi
  
- **📸 Fotoğraf Analiz Servisi**
  - Fotoğraf işleme ve analiz
  - AI model entegrasyonu
  - Güvenli dosya yönetimi
  
- **👗 Öneri Motoru**
  - Akıllı ürün eşleştirme
  - Hava durumuna göre filtreleme
  - Kişiselleştirilmiş öneriler

- **📊 Gelişmiş Loglama**
  - Winston logger entegrasyonu
  - Ayrı hata logları
  - Performans metrikleri

## 🛠️ Teknolojiler

- Node.js & Express.js
- MongoDB & Mongoose
- Jest & Supertest
- Winston Logger
- Docker & Docker Compose
- OpenWeatherMap API

## 🚀 Kurulum

1. Gerekli paketleri yükleyin:
```bash
npm install
```

2. Çevre değişkenlerini ayarlayın:
```bash
cp .env.example .env
```

3. Log dizinini oluşturun:
```bash
mkdir logs
```

4. Geliştirme modunda çalıştırın:
```bash
npm run dev
```

## 📦 Docker ile Çalıştırma

```bash
docker-compose up --build
```

## 🧪 Testler

### Tüm Testleri Çalıştırma
```bash
npm test
```

### Test Coverage Raporu
```bash
npm test -- --coverage
```

## 📝 API Endpoints

### Hava Durumu
- `GET /api/weather`
  - Güncel hava durumu bilgisi
  - Cache: 30 dakika
  - Rate limit: 100 istek/saat

### Fotoğraf Analizi
- `POST /api/analyze`
  - Fotoğraf analizi ve etiketleme
  - Max boyut: 5MB
  - Desteklenen formatlar: JPEG, PNG

### Ürün Önerileri
- `POST /api/recommendations`
  - Kişiselleştirilmiş ürün önerileri
  - Filtreleme parametreleri
  - Sayfalama desteği

## 🔧 Ortam Değişkenleri

- `PORT` - Sunucu portu (varsayılan: 3001)
- `MONGODB_URI` - MongoDB bağlantı URI'si
- `OPENWEATHER_API_KEY` - OpenWeather API anahtarı
- `NODE_ENV` - Çalışma ortamı (development/production)
- `LOG_LEVEL` - Log seviyesi (debug/info/warn/error)

## 📊 Monitoring

### Sağlık Kontrolü
- Endpoint: `/health`
- Metrikler:
  - Uptime
  - Bellek kullanımı
  - MongoDB bağlantı durumu
  
### Loglar
- Konum: `/logs`
  - `app.log`: Genel loglar
  - `error.log`: Hata logları
  - Otomatik rotasyon: 5MB
  - Maksimum 5 dosya

## 🛡️ Güvenlik

- CORS yapılandırması
- Rate limiting
- Request boyut limitleri
- Güvenli HTTP başlıkları
- Error handling middleware

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Notlar

- Geliştirme için Node.js 18+ gereklidir
- MongoDB 6.0+ önerilir
- OpenWeatherMap API anahtarı zorunludur
- Log dizini oluşturulmalıdır

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

