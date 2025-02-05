const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });

    logger.info(`MongoDB bağlantısı başarılı: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

// Bağlantı olaylarını dinle
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB bağlantısı kesildi');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB bağlantı hatası:', err);
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB bağlantısı kapatıldı');
    process.exit(0);
  } catch (error) {
    logger.error('MongoDB bağlantısı kapatılırken hata:', error);
    process.exit(1);
  }
});

module.exports = { connectDB }; 