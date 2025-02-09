# Akıllı Ayna Kiosk Sistemi

Akıllı Ayna Kiosk Sistemi, kullanıcıların kıyafetleri sanal olarak denemelerine olanak sağlayan modern bir e-ticaret çözümüdür. Sistem, yapay zeka destekli virtual try-on teknolojisi ile kullanıcıların kıyafetleri üzerlerinde nasıl duracağını görmelerini sağlar ve beğendikleri ürünlere QR kod ile hızlıca erişmelerini mümkün kılar.

## Özellikler

- 👕 Virtual Try-On: Kıyafetleri gerçek zamanlı olarak deneme
- 📱 QR Kod Entegrasyonu: Beğenilen ürünlere hızlı erişim
- 🛍️ Ürün Yönetimi: Kapsamlı ürün kataloğu yönetimi
- 📸 Kamera Entegrasyonu: Gerçek zamanlı görüntü işleme
- 🔍 Ürün Önerileri: Yapay zeka destekli ürün önerileri
- 📊 Stok Takibi: Gerçek zamanlı stok yönetimi
- 🌐 Modern Web Arayüzü: Kullanıcı dostu tasarım

## Teknoloji Yığını

### Backend
- FastAPI
- PostgreSQL
- Redis
- TensorFlow
- SQLAlchemy
- Alembic
- Python 3.11

### Frontend
- React
- TypeScript
- Tailwind CSS
- Axios

### DevOps
- Docker
- Docker Compose
- Health Checks
- Resource Management

## Başlangıç

### Gereksinimler
- Docker
- Docker Compose
- Git

### Kurulum

1. Projeyi klonlayın:
```bash
git clone [repo-url]
cd smart-mirror
```

2. Ortam değişkenlerini ayarlayın:
```bash
cp backend/.env.example backend/.env
# .env dosyasını düzenleyin
```

3. Sistemi başlatın:
```bash
docker-compose up -d
```

4. Veritabanı migrasyonlarını çalıştırın:
```bash
docker-compose exec backend alembic upgrade head
```

Sistem http://localhost:3000 adresinde çalışmaya başlayacaktır.

## API Endpoint'leri

### Ürün Yönetimi
- `POST /products/`: Yeni ürün ekle
- `GET /products/`: Ürünleri listele
- `GET /products/{id}`: Ürün detaylarını getir
- `PUT /products/{id}`: Ürün bilgilerini güncelle
- `DELETE /products/{id}`: Ürünü sil (soft delete)
- `GET /products/categories/`: Kategorileri listele
- `GET /products/brands/`: Markaları listele
- `GET /products/{id}/qr`: Ürün QR kodunu getir

### Virtual Try-On
- `POST /virtual-try-on/`: Kıyafet deneme simülasyonu

### Sistem
- `GET /health`: Sistem sağlık kontrolü

## Geliştirme

### Backend Geliştirme
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Geliştirme
```bash
cd frontend/kiosk
npm install
npm start
```

## Test

### Backend Testleri
```bash
cd backend
pytest
```

### Frontend Testleri
```bash
cd frontend/kiosk
npm test
```

## Dağıtım

Production ortamı için:
1. `.env` dosyasında production ayarlarını yapın
2. `docker-compose.prod.yml` dosyasını kullanın
3. SSL sertifikalarını ekleyin
4. Güvenlik ayarlarını yapılandırın

## Güvenlik

- API anahtarları güvenli bir şekilde yönetilmelidir
- Production ortamında CORS ayarları kısıtlanmalıdır
- Rate limiting uygulanmalıdır
- SSL/TLS kullanılmalıdır

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.