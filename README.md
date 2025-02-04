 Moda Selfie Ayna 🪞

Moda Selfie, AVM'lerde ve popüler noktalarda yer alacak interaktif aynalardan, kullanıcının çektiği fotoğrafı analiz ederek hava durumuna ve belirlenen koşullara uygun Trendyol Milla ürünlerini QR kod ile öneren akıllı bir sistemdir.

 🌟 Özellikler

- 🌤️ Canlı Hava Durumu: OpenWeatherMap API entegrasyonu ile gerçek zamanlı hava durumu bilgisi
- 📸 Akıllı Fotoğraf Çekimi: Kullanıcı dostu kamera arayüzü
- 🤖 Fotoğraf Analizi: Yapay zeka destekli fotoğraf analizi
- 👗 Akıllı Ürün Önerileri: Hava durumu ve kullanıcı stiline göre kişiselleştirilmiş öneriler
- 📱 QR Kod Entegrasyonu: Kolay ürün erişimi için QR kod sistemi

 🛠️ Teknoloji Yığını

 Backend
- Node.js & Express
- MongoDB & Mongoose
- Jest & Supertest
- OpenWeatherMap API

 Frontend
- React 18
- Axios
- React Webcam
- Modern CSS3

 DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- ESLint & Prettier
- Jest Test Framework

 🚀 Kurulum

 Gereksinimler
- Node.js (v18+)
- MongoDB (v6.0+)
- Docker & Docker Compose (opsiyonel)
- OpenWeatherMap API Anahtarı

 1. Projeyi Klonlama

git clone https://github.com/halilberkayy/moda-selfie.git

cd moda-selfie


 2. Backend Kurulumu
cd backend
cp .env.example .env   .env dosyasını düzenleyin
npm install
npm run seed   Örnek verileri yükle
npm run dev

 3. Frontend Kurulumu

cd frontend
cp .env.example .env   .env dosyasını düzenleyin
npm install
npm start


 4. Docker ile Çalıştırma
 Tüm servisleri başlat
docker-compose -f backend/docker-compose.yml -f frontend/docker-compose.yml up --build


🧪 Test

-Backend Testleri-
cd backend
npm test

-Frontend Testleri-

cd frontend
npm test


 Lint Kontrolleri

 -Backend-
cd backend
npm run lint

 -Frontend-
cd frontend
npm run lint


 📦 Deployment

Proje GitHub Actions ile otomatik olarak deploy edilmektedir:
1. Main branch'e push yapıldığında testler çalışır
2. Testler başarılı ise Docker imajları oluşturulur
3. İmajlar Docker Hub'a gönderilir
4. Üretim sunucusunda otomatik güncelleme yapılır

 🔧 Yönetim Araçları

- MongoDB Yönetimi: http://localhost:8081
- API Dokümantasyonu: http://localhost:5000/api/docs
- Docker Konteyner Yönetimi: docker-compose ps

 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (\`git checkout -b feature/amazing-feature\`)
3. Değişikliklerinizi commit edin (\`git commit -m 'feat: Add amazing feature'\`)
4. Branch'inizi push edin (\`git push origin feature/amazing-feature\`)
5. Pull Request oluşturun

 📝 Notlar

- Fotoğraf analizi şu an simülasyon modunda çalışmaktadır
- Gerçek ML modeli entegrasyonu için \`src/utils/aiAnalyzer.js\` güncellenmelidir
- Ürün verileri MongoDB'ye seed script ile yüklenmektedir

 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

 🙏 Teşekkürler

- OpenWeatherMap API
- MongoDB
- React Topluluğu
- Docker Topluluğu
