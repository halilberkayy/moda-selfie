const express = require('express');
const router = express.Router();
const { AppError } = require('../utils/errorHandler');

const weatherController = require('../controllers/weatherController');
const recommendationController = require('../controllers/recommendationController');

// Hava durumu bilgisini döndüren endpoint
router.get('/weather', weatherController.getWeather);

// Fotoğraf analiz endpoint (simülasyon)
router.post('/analyze', async (req, res, next) => {
  try {
    const { photo } = req.body;
    
    if (!photo) {
      throw new AppError('Fotoğraf verisi gereklidir', 400);
    }

    console.log('Fotoğraf analizi başlatılıyor...');
    const analysisResult = await require('../utils/aiAnalyzer').analyzePhoto(photo);
    console.log('Analiz sonucu:', analysisResult);
    
    res.json({ analysis: analysisResult });
  } catch (error) {
    console.error('Fotoğraf analizi hatası:', error);
    next(error);
  }
});

// Ürün önerileri endpoint
router.get('/products', async (req, res, next) => {
  try {
    const { tag } = req.query;
    
    if (!tag) {
      throw new AppError('Tag parametresi gereklidir', 400);
    }

    console.log('Ürün önerileri alınıyor, tag:', tag);
    const products = await recommendationController.getProductsByTag(req, res, next);
    console.log('Bulunan ürün sayısı:', products ? products.length : 0);
    
    if (!products || products.length === 0) {
      throw new AppError('Bu tag için ürün bulunamadı', 404);
    }
  } catch (error) {
    console.error('Ürün önerileri hatası:', error);
    next(error);
  }
});

module.exports = router;