const axios = require('axios');
const AppError = require('../middleware/errorHandler');
const logger = require('../config/logger');

// OpenWeatherMap API'den hava durumu verisi al
const getWeatherData = async (req, res, next) => {
  try {
    // Varsayılan olarak İstanbul koordinatları
    const lat = req.query.lat || 41.0082;
    const lon = req.query.lon || 28.9784;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=tr`
    );

    const weatherData = {
      temperature: Math.round(response.data.main.temp),
      feelsLike: Math.round(response.data.main.feels_like),
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      location: response.data.name
    };

    // Hava durumuna göre etiketler oluştur
    const tags = [];

    // Sıcaklığa göre etiketler
    if (weatherData.temperature < 10) {
      tags.push('soğuk', 'kış');
    } else if (weatherData.temperature < 20) {
      tags.push('ılıman', 'bahar');
    } else if (weatherData.temperature < 30) {
      tags.push('sıcak', 'yaz');
    } else {
      tags.push('çok-sıcak', 'yaz');
    }

    // Hava durumuna göre etiketler
    if (response.data.weather[0].main === 'Rain') {
      tags.push('yağmurlu');
    } else if (response.data.weather[0].main === 'Snow') {
      tags.push('karlı');
    } else if (response.data.weather[0].main === 'Clear') {
      tags.push('güneşli');
    } else if (response.data.weather[0].main === 'Clouds') {
      tags.push('bulutlu');
    }

    weatherData.tags = tags;

    logger.info('Hava durumu verileri başarıyla alındı', {
      location: weatherData.location,
      temperature: weatherData.temperature,
      tags: weatherData.tags
    });

    res.status(200).json({
      status: 'success',
      data: weatherData
    });
  } catch (error) {
    logger.error('Hava durumu verileri alınırken hata oluştu:', error);
    return next(new AppError('Hava durumu verileri alınamadı', 500));
  }
};

module.exports = {
  getWeatherData
}; 