const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Moda Selfie API',
      version: '1.0.0',
      description: 'Moda Selfie uygulaması için REST API dokümantasyonu',
      contact: {
        name: 'API Desteği',
        email: 'support@modaselfie.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Geliştirme sunucusu'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // routes klasöründeki tüm dosyaları tara
};

const specs = swaggerJsdoc(options);

module.exports = specs; 