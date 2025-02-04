const Product = require('../models/Product');
const { AppError } = require('../utils/errorHandler');

exports.getProductsByTag = async (req, res, next) => {
  try {
    const { tag } = req.query;
    if (!tag) {
      throw new AppError('Tag parametresi gereklidir.', 400);
    }

    console.log('Veritabanında aranıyor:', tag);
    const products = await Product.find({ tags: tag });
    console.log('Bulunan ürünler:', products);

    if (!products || products.length === 0) {
      throw new AppError(`"${tag}" etiketi için ürün bulunamadı.`, 404);
    }

    res.json(products);
    return products; // Router'da kullanılabilmesi için dönüyoruz
  } catch (error) {
    console.error('Ürün arama hatası:', error);
    next(error);
  }
};