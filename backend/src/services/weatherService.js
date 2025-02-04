const axios = require('axios');
const { AppError } = require('../utils/errorHandler');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
  }

  async getWeather(city = 'Istanbul') {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric',
          lang: 'tr'
        }
      });

      const { main, weather } = response.data;
      
      return {
        temperature: Math.round(main.temp),
        condition: weather[0].description,
        icon: `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`,
        humidity: main.humidity,
        feelsLike: Math.round(main.feels_like)
      };
    } catch (error) {
      console.error('Hava durumu API hatası:', error);
      throw new AppError('Hava durumu bilgisi alınamadı', 503);
    }
  }
}

module.exports = new WeatherService();