# 🪞 Moda Aynası

Yapay zeka destekli kişisel moda asistanınız. Fotoğrafınızı çekin, size özel kıyafet önerileri alın ve sanal olarak deneyin!

## 🌟 Özellikler

- 📸 **Anlık Fotoğraf Çekimi**: Webcam ile kolay fotoğraf çekimi
- 🤖 **AI Destekli Analiz**: DeepFashion AI ile stil analizi
- 🌡️ **Hava Durumu Entegrasyonu**: Bulunduğunuz konumun hava durumuna göre öneriler
- 👕 **Sanal Deneme**: Kolors AI ile kıyafetleri üzerinizde görün
- 📱 **QR Kod**: Beğendiğiniz ürünlere hızlı erişim
- 🎨 **Modern Arayüz**: Responsive ve kullanıcı dostu tasarım
- 🔒 **Güvenli**: KVKK uyumlu veri işleme

## 🛠️ Teknolojiler

### Backend
- **Framework**: FastAPI
- **AI/ML**: PyTorch, DeepFashion
- **Veritabanı**: Redis (önbellekleme)
- **API Entegrasyonları**: 
  - OpenWeather API (hava durumu)
  - Kolors AI API (sanal deneme)
- **Güvenlik**:Rate Limiting, CORS

### Frontend
- **Framework**: React
- **UI**: TailwindCSS
- **State Management**: React Hooks
- **API Client**: Axios
- **Medya**: react-webcam

## 🚀 Kurulum

### Gereksinimler
- Python 3.8+
- Node.js 14+
- Redis

### Backend Kurulumu
```bash
# Sanal ortam oluştur
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Bağımlılıkları yükle
pip install -r requirements.txt

# .env dosyasını oluştur
cp .env.example .env
# .env dosyasını düzenle

# Uygulamayı çalıştır
uvicorn app.main:app --reload
```

### Frontend Kurulumu
```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start
```

### Docker ile Kurulum
```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları görüntüle
docker-compose logs -f
```

## 📝 API Dokümantasyonu

API dokümantasyonuna aşağıdaki URL'lerden erişebilirsiniz:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Temel Endpointler

- `POST /analyze`: Fotoğraf analizi ve ürün önerileri
- `GET /weather`: Hava durumu bilgisi
- `POST /images/kolors-virtual-try-on`: Sanal deneme
- `POST /qrcode`: QR kod oluşturma
- `DELETE /delete`: KVKK veri silme

## 🧪 Testler

### Backend Testleri
```bash
# Unit testleri çalıştır
pytest

# Belirli bir test dosyasını çalıştır
pytest tests/test_analyze.py
```

### Frontend Testleri
```bash
# Unit testleri çalıştır
npm test

# Test coverage raporu
npm test -- --coverage
```

## 🔐 Güvenlik

- KVKK uyumlu veri işleme
- Rate limiting ile DDoS koruması
- CORS politikası
- Güvenli dosya işleme
- Redis bağlantı havuzu

## 🎯 Kullanım Senaryoları

1. **Kıyafet Önerisi Alma**
   - KVKK onayı ver
   - Fotoğraf çek
   - AI destekli önerileri gör

2. **Sanal Deneme**
   - Önerilen kıyafeti seç
   - Sanal deneme sonucunu gör
   - QR kod ile ürüne eriş

3. **Hava Durumuna Göre Öneri**
   - Konum izni ver
   - Hava durumuna uygun öneriler al

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👥 Ekip

- Halil Berkay Şahin - Proje Lideri & Genel Geliştirici

## 📞 İletişim

- linkedin: [linkedin.com/in/halilberkay](https://linkedin.com/in/halilberkay)
- Email: [halilberkaysahin@gmail.com](mailto:halilberkaysahin@gmail.com)
- GitHub: [github.com/halilberkayy](https://github.com/halilberkayy)

## 🙏 Kullanılan API ve Veri Setleri

- [OpenWeather API](https://openweathermap.org/api) - Hava durumu verileri
- [Kolors AI](https://klingai.com) - Sanal kıyafet deneme
- [DeepFashion](https://mmlab.ie.cuhk.edu.hk/projects/DeepFashion.html) - Kıyafet analizi ve sınıflandırma
- [Fashion-MNIST](https://github.com/zalandoresearch/fashion-mnist) - Kıyafet tanıma eğitimi

## Moda Aynası API

Yapay zeka destekli kişisel moda asistanı API'si.

### Özellikler

- 🌤️ Hava Durumu Entegrasyonu
- 👕 Kıyafet Analizi ve Öneri
- 🎯 Sanal Deneme
- 📱 QR Kod Entegrasyonu

### API Endpoints

#### Hava Durumu (`/weather`)
- `GET /weather?location={location}`: Belirtilen konum için hava durumu bilgisini getirir

#### Kıyafet Analizi (`/analyze`)
- `POST /analyze`: Kıyafet fotoğrafını analiz eder ve öneriler sunar
  - Request: `{ "image": "base64...", "location": "Istanbul" }`
  - Response: `{ "style": "casual", "recommendations": [...], "weather_data": {...} }`

#### Sanal Deneme (`/virtual-try-on`)
- `POST /virtual-try-on`: Kullanıcı ve ürün fotoğraflarını kullanarak sanal deneme yapar
  - Request: `{ "user_image": "base64...", "product_image": "base64..." }`
  - Response: `{ "result_image": "base64...", "success": true }`

#### QR Kod (`/qrcode`)
- `POST /qrcode`: Ürün bilgilerine göre QR kod oluşturur
  - Request: `{ "product_id": "123", "size": "M", "color": "Blue" }`
  - Response: `{ "qr_token": "base64..." }`

### Kurulum

1. Python 3.8+ yüklü olmalıdır
2. Virtual environment oluşturun:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate  # Windows
```

3. Gereksinimleri yükleyin:
```bash
pip install -r requirements.txt
```

4. `.env` dosyasını oluşturun:
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

5. API'yi başlatın:
```bash
uvicorn app.main:app --reload
```

### API Dokümantasyonu

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

### Geliştirme

- Backend: FastAPI
- Hava Durumu: OpenWeather API
- Kıyafet Analizi: DeepFashion AI
- Sanal Deneme: Kolors API
- QR Kod: qrcode kütüphanesi

### Lisans

MIT License
