require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const { errorHandler } = require('./middleware/errorHandler');
const { connectDB } = require('./config/db');
const logger = require('./config/logger');
const routes = require('./routes/api');

// Express uygulamasını oluştur
const app = express();

// Swagger yapılandırması
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Moda Selfie API',
      version: '1.0.0',
      description: 'Moda Selfie Aynası API dokümantasyonu',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Geliştirme sunucusu',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware'leri ekle
app.use(helmet()); // Güvenlik başlıkları
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(morgan('combined', { stream: logger.stream })); // HTTP istekleri logla
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar için klasör
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API dokümantasyonu
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API rotalarını ekle
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// Error handler
app.use(errorHandler);

// Veritabanı bağlantısı ve sunucuyu başlat
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Sunucu ${PORT} portunda çalışıyor`);
      logger.info(`API Dokümantasyonu: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Sunucu başlatılamadı:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM sinyali alındı. Sunucu kapatılıyor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT sinyali alındı. Sunucu kapatılıyor...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('Yakalanmamış hata:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('İşlenmemiş promise reddi:', error);
  process.exit(1);
});

startServer();