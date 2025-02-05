const { AppError, errorHandler } = require('../src/utils/errorHandler');

describe('AppError', () => {
  it('doğru şekilde hata nesnesi oluşturmalı', () => {
    const error = new AppError('Test hatası', 400);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Test hatası');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
  });

  it('500 ve üzeri durum kodları için status "error" olmalı', () => {
    const error = new AppError('Sunucu hatası', 500);
    expect(error.status).toBe('error');
  });
});

describe('errorHandler middleware', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('AppError için doğru yanıt döndürmeli', () => {
    const error = new AppError('Test hatası', 400);
    
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Test hatası'
    });
  });

  it('statusCode olmayan hatalar için 500 döndürmeli', () => {
    const error = new Error('Bilinmeyen hata');
    
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: error.message
    });
  });
}); 