# 📌 Akıllı Ayna Kiosk Sistemi

Akıllı Ayna Kiosk Sistemi, kullanıcıların kıyafetleri sanal olarak denemelerini sağlayan yapay zeka destekli modern bir uygulamadır. Görüntü işleme teknolojilerini kullanarak, kullanıcıların gerçek zamanlı olarak kıyafet denemelerini ve mağaza ürünleriyle eşleşmelerini sağlar.

---

## 🚀 Özellikler

- ✅ **Gerçek Zamanlı Kamera Entegrasyonu** – Kullanıcıların yüz ve vücut tespiti ile sanal kıyafet deneyimi yaşamasını sağlar.
- ✅ **Yapay Zeka Destekli Kıyafet Deneme** – AI tabanlı görüntü işleme modelleri ile kıyafetleri gerçekçi şekilde kullanıcı üzerine yerleştirir.
- ✅ **Kişiselleştirilmiş Ürün Önerileri** – Hava durumu, moda trendleri ve kullanıcı tercihlerine göre öneriler sunar.
- ✅ **Anlık Görüntü İşleme ve Önizleme** – Yüksek hızda ve gerçek zamanlı kıyafet değiştirme özelliği sağlar.
- ✅ **QR Kod Entegrasyonu** – Kullanıcıların denediği kıyafetleri telefonlarına aktarmaları için QR kod üretir.
- ✅ **KVKK & GDPR Uyumlu** – Kullanıcı verilerinin güvenliğini ve gizliliğini ön planda tutar.
- ✅ **Mobil & Tablet Uyumlu (Responsive Design)** – Kiosk cihazları, tabletler ve mobil telefonlarla uyumludur.

---

## 🤦‍💻 Teknoloji Stack

### 🖥 Frontend
- ⚛ React 18 (TypeScript ile)
- 🛋 Zustand (State Yönetimi)
- 🎨 Tailwind CSS (Stil Yönetimi)
- 🌐 Axios (API İstekleri)
- 📷 React Webcam (Gerçek zamanlı kamera erişimi)
- 🔔 React Toastify (Bildirimler)

### 🖥 Backend
- 🚀 FastAPI (Python 3.9+)
- 💥 PostgreSQL (Veritabanı)
- 🔥 Redis (Önbellekleme)
- 🤖 TensorFlow/Keras (AI Modeli)
- ⚙ SQLAlchemy (ORM)
- 🔄 Alembic (Veritabanı Migrasyonları)

---

## 📁 Proje Yapısı

```
smart-mirror/
├── frontend/
│   └── kiosk/
│       ├── src/
│       │   ├── api/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── utils/
│       │   └── constants.ts
├── backend/
│   ├── ai-model/
│   ├── middleware/
│   ├── alembic/
│   ├── main.py
│   ├── models.py
│   ├── services/
│   ├── routes/
│   ├── config.py
│   └── database.py
└── docker-compose.yml
```

---

## ⚡ Kurulum

### 🔹 Gereksinimler
- 🦈 Docker & Docker Compose
- 🟢 Node.js 18+
- 🐍 Python 3.9+
- 💥 PostgreSQL 13+
- 🔥 Redis 6+

### 🖥 Backend Kurulumu

1. Sanal ortam oluşturun ve etkinleştirin:
   ```sh
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate  # Windows
   ```
2. Bağımlılıkları yükleyin:
   ```sh
   cd backend
   pip install -r requirements.txt
   ```
3. Çevre değişkenlerini ayarlayın:
   ```sh
   cp .env.example .env
   # .env dosyasını düzenleyin
   ```
4. Veritabanı migrasyonlarını çalıştırın:
   ```sh
   alembic upgrade head
   ```

---

## 🏠 Docker ile Çalıştırma

Tüm sistemi Docker ile başlatmak için:
```sh
docker-compose up -d
```

---

## 🔒 Güvenlik Önlemleri
- ✅ CORS koruması
- ✅ Rate limiting (API istek sınırlandırması)
- ✅ Request boyut sınırlaması
- ✅ HTTP güvenlik başlıkları
- ✅ JWT authentication
- ✅ SQL Injection & XSS Koruması

---

## 📊 Monitoring ve Loglama
- 📊 Prometheus Metrikleri: `/metrics`
- 💓 Health Check Endpoint: `/health`
- 🔍 Sentry Entegrasyonu

---

## 📢 Lisans

Bu proje **MIT** lisansı altında sunulmaktadır. Detaylar için **LICENSE** dosyasına bakabilirsiniz.

---

## 📩 İletişim

- **Proje Sorumlusu**: Halil Berkay Şahin
- **E-Posta**: [halilberkaysahin@gmail.com](mailto:halilberkaysahin@gmail.com)
- **LinkedIn**: [https://www.linkedin.com/in/halilberkay/](https://www.linkedin.com/in/halilberkay/)

