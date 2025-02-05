const winston = require('winston');
const path = require('path');

// Log dosyaları için dizin yolu
const logDir = path.join(__dirname, '../../logs');

// Log formatı
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Logger seviyesi
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Logger yapılandırması
const logger = winston.createLogger({
  level: level,
  format: logFormat,
  transports: [
    // Hata logları için
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Tüm loglar için
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Geliştirme ortamında konsola da log bas
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Morgan için stream
logger.stream = {
  write: (message) => logger.info(message.trim())
};

module.exports = logger; 