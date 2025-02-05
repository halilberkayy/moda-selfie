const weatherService = require('../services/weatherService');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

exports.getWeather = async (req, res, next) => {
  try {
    logger.info('Hava durumu bilgisi istendi');
    
    const weatherData = await weatherService.getWeather();
    
    if (!weatherData) {
      logger.error('Hava durumu verisi alınamadı');
      throw new AppError('Hava durumu verisi bulunamadı', 404);
    }

    logger.info('Hava durumu bilgisi başarıyla alındı', { data: weatherData });

    res.status(200).json({
      status: 'success',
      data: weatherData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Hava durumu servisi hatası', { 
      error: error.message,
      stack: error.stack 
    });

    const statusCode = error instanceof AppError ? error.statusCode : 503;
    const errorMessage = error instanceof AppError 
      ? error.message 
      : 'Hava durumu bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.';

    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}; 