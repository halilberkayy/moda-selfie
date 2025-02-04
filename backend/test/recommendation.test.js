const request = require('supertest');
const express = require('express');
const recommendationController = require('../src/controllers/recommendationController');
const Product = require('../src/models/Product');

const app = express();
app.use(express.json());
app.get('/products', recommendationController.getProductsByTag);

// MongoDB modelini mocklayalım
jest.mock('../src/models/Product');

describe('GET /products', () => {
  beforeEach(() => {
    // Her test öncesi mockları temizle
    jest.clearAllMocks();
  });

  it('tag parametresi olmadan 400 hatası döndürmeli', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Tag parametresi gereklidir.');
  });

  it('geçerli tag ile ürünleri döndürmeli', async () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Test Ürün 1',
        imageUrl: 'http://test.com/1.jpg',
        qrCodeUrl: 'http://test.com/qr1',
        tags: ['trenchcoat']
      }
    ];

    Product.find.mockResolvedValue(mockProducts);

    const res = await request(app).get('/products?tag=trenchcoat');
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('name', 'Test Ürün 1');
    expect(Product.find).toHaveBeenCalledWith({ tags: 'trenchcoat' });
  });

  it('veritabanı hatası durumunda 500 hatası döndürmeli', async () => {
    Product.find.mockRejectedValue(new Error('DB Hatası'));

    const res = await request(app).get('/products?tag=trenchcoat');
    
    expect(res.statusCode).toBe(500);
  });
}); 