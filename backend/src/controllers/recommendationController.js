const sharp = require('sharp');
const Product = require('../models/Product');
const AppError = require('../middleware/errorHandler');
const logger = require('../config/logger');

const getProductsByTag = async (req, res, next) => {
  try {
    const { tags, limit = 10, page = 1 } = req.query;

    // Etiketleri diziye çevir
    const searchTags = Array.isArray(tags) ? tags : tags.split(',');

    // Veritabanında ara
    const products = await Product.find({ tags: { $in: searchTags } });

    if (products.length === 0) {
      return next(new AppError(`"${searchTags.join(', ')}" etiketleri için ürün bulunamadı.`, 404));
    }

    // Sayfalama hesaplamaları
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    const response = {
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(products.length / limit),
        totalProducts: products.length
      }
    };

    res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (error) {
    logger.error('Ürün arama hatası:', error);
    return next(new AppError('Ürün araması sırasında bir hata oluştu', 500));
  }
};

const analyzeAndRecommend = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Lütfen bir resim yükleyin', 400));
    }

    // Resmi işle
    const processedImageBuffer = await sharp(req.file.path)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Resim analizi simülasyonu
    const imageTags = await simulateImageAnalysis();

    // Hava durumu etiketlerini al (eğer varsa)
    const weatherTags = req.body.weatherTags ? JSON.parse(req.body.weatherTags) : [];

    // Tüm etiketleri birleştir ve benzersiz yap
    const allTags = [...new Set([...imageTags, ...weatherTags])];

    logger.info('Resim analizi tamamlandı', {
      originalSize: req.file.size,
      processedSize: processedImageBuffer.length,
      tags: allTags
    });

    // Etiketlere göre ürün önerileri
    const products = await Product.find({ tags: { $in: allTags } })
      .limit(6)
      .select('-__v');

    const recommendations = {
      tags: allTags,
      message: products.length > 0 ? 'Resim başarıyla analiz edildi ve ürünler bulundu' : 'Resim analiz edildi fakat uygun ürün bulunamadı',
      suggestedProducts: products
    };

    res.status(200).json({
      status: 'success',
      data: recommendations
    });
  } catch (error) {
    logger.error('Resim analizi sırasında hata:', error);
    return next(new AppError('Resim analizi yapılamadı', 500));
  }
};

// Resim analizi simülasyonu
const simulateImageAnalysis = async () => {
  const possibleTags = [
    'casual', 'formal', 'spor', 'klasik', 'modern',
    'vintage', 'bohem', 'minimalist', 'elegant', 'trend',
    'basic', 'sokak-stili', 'ofis', 'gece', 'plaj'
  ];

  // Rastgele 3-5 etiket seç
  const numTags = Math.floor(Math.random() * 3) + 3;
  const selectedTags = [];

  while (selectedTags.length < numTags) {
    const randomTag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
    if (!selectedTags.includes(randomTag)) {
      selectedTags.push(randomTag);
    }
  }

  return selectedTags;
};

module.exports = {
  getProductsByTag,
  analyzeAndRecommend
}; 