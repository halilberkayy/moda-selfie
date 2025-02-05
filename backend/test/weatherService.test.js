const axios = require('axios');
const weatherService = require('../src/services/weatherService');
const { AppError } = require('../src/utils/errorHandler');

jest.mock('axios');

describe('WeatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('başarılı API yanıtını doğru formatta dönüştürmeli', async () => {
    const mockApiResponse = {
      data: {
        main: {
          temp: 18.5,
          humidity: 80,
          feels_like: 16.3
        },
        weather: [
          {
            description: 'Yağmurlu',
            icon: '10d'
          }
        ]
      }
    };

    axios.get.mockResolvedValue(mockApiResponse);

    const result = await weatherService.getWeather();

    expect(result).toEqual({
      temperature: 19,
      condition: 'Yağmurlu',
      icon: 'https://openweathermap.org/img/wn/10d@2x.png',
      humidity: 80,
      feelsLike: 16
    });

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          q: 'Istanbul',
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
          lang: 'tr'
        }
      }
    );
  });

  it('farklı şehir parametresi ile çağrılabilmeli', async () => {
    const mockApiResponse = {
      data: {
        main: {
          temp: 25,
          humidity: 60,
          feels_like: 26
        },
        weather: [
          {
            description: 'Güneşli',
            icon: '01d'
          }
        ]
      }
    };

    axios.get.mockResolvedValue(mockApiResponse);

    const result = await weatherService.getWeather('Ankara');

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          q: 'Ankara',
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
          lang: 'tr'
        }
      }
    );
  });

  it('API hatası durumunda AppError fırlatmalı', async () => {
    const mockError = new Error('API Error');
    axios.get.mockRejectedValue(mockError);

    await expect(weatherService.getWeather()).rejects.toThrow(AppError);
    await expect(weatherService.getWeather()).rejects.toHaveProperty('statusCode', 503);
  });
}); 