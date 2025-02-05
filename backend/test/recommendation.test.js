const request = require('supertest');
const setupTestApp = require('./setup');
const Product = require('../src/models/Product');
const recommendationController = require('../src/controllers/recommendationController');

jest.mock('../src/models/Product');

const app = setupTestApp();
app.get('/products', recommendationController.getProductsByTag);

describe('GET /products', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tag parametresi olmadan 400 hatası döndürmeli', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      status: 'fail',
      message: 'Tag parametresi gereklidir.'
    });
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
    expect(res.body).toEqual({
      status: 'success',
      data: mockProducts
    });
  });

  it('bulunamayan tag için 404 hatası döndürmeli', async () => {
    Product.find.mockResolvedValue([]);

    const res = await request(app).get('/products?tag=nonexistent');
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 'fail',
      message: '"nonexistent" etiketi için ürün bulunamadı.'
    });
  });

  it('veritabanı hatası durumunda 500 hatası döndürmeli', async () => {
    const dbError = new Error('DB Hatası');
    Product.find.mockRejectedValue(dbError);

    const res = await request(app).get('/products?tag=trenchcoat');
    
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      status: 'error',
      message: 'Bir şeyler yanlış gitti!'
    });
  });
}); 