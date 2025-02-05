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

    if (products.length === 0) {
      throw new AppError(`"${tag}" etiketi için ürün bulunamadı.`, 404);
    }

    res.status(200).json({
      status: 'success',
      data: products
    });
  } catch (error) {
    console.error('Ürün arama hatası:', error);
    if (!error.statusCode) {
      error.statusCode = 500;
      error.status = 'error';
      error.message = 'Bir şeyler yanlış gitti!';
    }
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  }
}; 