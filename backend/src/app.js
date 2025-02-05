const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const { connectDB } = require('./config/db');
const logger = require('./config/logger');
const routes = require('./routes');

// Express uygulamasını oluştur
const app = express();

// Middleware'leri ekle
app.use(helmet()); // Güvenlik başlıkları
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(morgan('combined', { stream: logger.stream })); // HTTP isteklerini logla
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar için klasör
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

module.exports = { app, startServer }; 