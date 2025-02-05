const express = require('express');
const { errorHandler } = require('../src/utils/errorHandler');

// Test ortamı için environment değişkenlerini ayarla
process.env.NODE_ENV = 'test';

const setupTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Route'ları ekle
  const configuredApp = app;
  
  // Global error handler'ı en sonda ekle
  configuredApp.use((err, req, res, next) => {
    console.log('Error handler çalıştı:', err);
    
    // Hata durumunu ve mesajını ayarla
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';
    const message = err.message || 'Bir şeyler yanlış gitti!';
    
    // Yanıtı gönder
    res.status(statusCode);
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: status,
      message: message
    }));
  });
  
  return configuredApp;
};

module.exports = setupTestApp; 