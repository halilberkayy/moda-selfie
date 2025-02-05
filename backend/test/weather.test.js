const request = require('supertest');
const setupTestApp = require('./setup');
const weatherService = require('../src/services/weatherService');
const weatherController = require('../src/controllers/weatherController');

jest.mock('../src/services/weatherService');

const app = setupTestApp();
app.get('/weather', weatherController.getWeather);

describe('GET /weather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hava durumu bilgisini döndürmeli', async () => {
    const mockWeather = {
      temperature: 18,
      condition: 'Yağmurlu',
      icon: 'http://example.com/icon.png',
      humidity: 80,
      feelsLike: 16
    };

    weatherService.getWeather.mockResolvedValue(mockWeather);

    const res = await request(app).get('/weather');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: 'success',
      data: mockWeather
    });
  });

  it('hava durumu API hatası durumunda 503 hatası döndürmeli', async () => {
    weatherService.getWeather.mockRejectedValue(new Error('API Hatası'));
    
    const res = await request(app).get('/weather');
    
    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({
      status: 'error',
      message: 'Hava durumu bilgisi alınamadı'
    });
  });
}); 