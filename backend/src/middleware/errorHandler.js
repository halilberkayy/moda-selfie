const logger = require('../config/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error('Hata:', {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode
    });

    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Üretim ortamında
    logger.error('Hata:', err);

    // Operasyonel, güvenilir hata: istemciye mesaj gönder
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Programlama veya bilinmeyen hata: detayları sızdırma
      res.status(500).json({
        status: 'error',
        message: 'Bir şeyler yanlış gitti!'
      });
    }
  }
};

module.exports = AppError;
module.exports.errorHandler = errorHandler; 