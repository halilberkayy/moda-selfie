const express = require('express');
const multer = require('multer');
const { getWeatherData } = require('../controllers/weatherController');
const { analyzeAndRecommend, getProductsByTag } = require('../controllers/recommendationController');
const AppError = require('../middleware/errorHandler');

const router = express.Router();

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Lütfen sadece resim dosyası yükleyin.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * @swagger
 * /api/weather:
 *   get:
 *     summary: Hava durumu bilgisini getirir
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Enlem
 *       - in: query
 *         name: lon
 *         schema:
 *           type: number
 *         description: Boylam
 *     responses:
 *       200:
 *         description: Başarılı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/weather', getWeatherData);

/**
 * @swagger
 * /api/analyze:
 *   post:
 *     summary: Resim analizi ve ürün önerileri
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         description: Analiz edilecek resim
 *     responses:
 *       200:
 *         description: Başarılı
 *       400:
 *         description: Geçersiz istek
 *       500:
 *         description: Sunucu hatası
 */
router.post('/analyze', upload.single('image'), analyzeAndRecommend);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Etiketlere göre ürün önerileri getirir
 *     parameters:
 *       - in: query
 *         name: tags
 *         required: true
 *         schema:
 *           type: string
 *         description: Virgülle ayrılmış ürün etiketleri
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Sayfa başına ürün sayısı
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Sayfa numarası
 *     responses:
 *       200:
 *         description: Başarılı
 *       400:
 *         description: Geçersiz istek
 *       404:
 *         description: Ürün bulunamadı
 */
router.get('/products', getProductsByTag);

// 404 handler
router.use((req, res) => {
  res.status(404).json({ message: 'API endpoint bulunamadı' });
});

module.exports = router;