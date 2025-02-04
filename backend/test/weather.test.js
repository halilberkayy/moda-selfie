const request = require('supertest');
const express = require('express');
const weatherController = require('../src/controllers/weatherController');

const app = express();
app.use(express.json());
app.get('/weather', weatherController.getWeather);

describe('GET /weather', () => {
  it('hava durumu bilgisini döndürmeli', async () => {
    const res = await request(app).get('/weather');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('condition');
    expect(res.body).toHaveProperty('temperature');
    expect(typeof res.body.temperature).toBe('number');
  });
}); 