# Moda Selfie Aynası - Frontend 🖥️

Bu repo, Moda Selfie Aynası projesinin frontend kısmını içerir. Modern ve kullanıcı dostu bir arayüz ile kullanıcıların fotoğraf çekip stil önerileri almasını sağlar.

## 🌟 Özellikler

- **📸 Gelişmiş Kamera Entegrasyonu**
  - Otomatik kamera algılama
  - Hata yönetimi ve kullanıcı bildirimleri
  - Yükleme durumu göstergeleri
  
- **🎨 Modern UI/UX**
  - Responsive tasarım
  - Kullanıcı dostu arayüz
  - Yükleme ve hata durumu göstergeleri
  
- **🔄 Güçlü API Entegrasyonu**
  - Otomatik yeniden deneme mekanizması
  - Hata yönetimi
  - Timeout kontrolü

## 🛠️ Teknolojiler

- React 18
- Axios
- React Webcam
- Modern CSS3
- Jest & Testing Library
- ESLint & Prettier

## 🚀 Kurulum

1. Gerekli paketleri yükleyin:
```bash
npm install
```

2. Çevre değişkenlerini ayarlayın:
```bash
cp .env.example .env
echo "REACT_APP_API_URL=http://localhost:3001" >> .env
```

3. Geliştirme modunda çalıştırın:
```bash
npm start
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

## 🔧 Kullanılabilir Scriptler

- **npm start**: Geliştirme modunda çalıştırır
- **npm test**: Test suite'i çalıştırır
- **npm run build**: Üretim için build alır
- **npm run lint**: Kod kalitesi kontrolü
- **npm run lint:fix**: Otomatik düzeltilebilir lint hatalarını düzeltir

## 📁 Proje Yapısı

```
src/
├── components/        # UI bileşenleri
├── services/         # API servisleri
├── hooks/            # Custom React hooks
├── utils/            # Yardımcı fonksiyonlar
├── styles/           # CSS dosyaları
└── tests/            # Test dosyaları
```

## 🔍 Önemli Bileşenler

### CameraCapture
- Kamera erişimi ve fotoğraf çekimi
- Hata yönetimi
- Yükleme durumu göstergeleri

### API Servisleri
- Retry mekanizması
- Timeout kontrolü
- Hata yönetimi

## 🛡️ Hata Yönetimi

- Kamera erişim hataları
- API iletişim hataları
- Ağ bağlantı sorunları
- Yükleme hataları

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Notlar

- Geliştirme için Node.js 18+ gereklidir
- API_URL environment değişkeni zorunludur
- Kamera erişimi için HTTPS veya localhost gereklidir

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.