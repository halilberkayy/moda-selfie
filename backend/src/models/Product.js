const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ürün adı zorunludur'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Ürün açıklaması zorunludur'],
  },
  price: {
    type: Number,
    required: [true, 'Ürün fiyatı zorunludur'],
    min: [0, 'Fiyat 0\'dan küçük olamaz'],
  },
  originalPrice: {
    type: Number,
    min: [0, 'Orijinal fiyat 0\'dan küçük olamaz'],
  },
  discount: {
    type: Number,
    min: [0, 'İndirim oranı 0\'dan küçük olamaz'],
    max: [100, 'İndirim oranı 100\'den büyük olamaz'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Ürün görseli zorunludur'],
  },
  category: {
    type: String,
    required: [true, 'Ürün kategorisi zorunludur'],
    enum: ['elbise', 'üst', 'alt', 'dış-giyim', 'aksesuar'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  weatherTags: [{
    type: String,
    enum: ['soğuk', 'serin', 'ılık', 'sıcak', 'yağmurlu', 'karlı', 'rüzgarlı'],
  }],
  stock: {
    type: Number,
    required: [true, 'Stok bilgisi zorunludur'],
    min: [0, 'Stok 0\'dan küçük olamaz'],
  },
  url: {
    type: String,
    required: [true, 'Ürün URL\'i zorunludur'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// İndirim hesaplama
productSchema.pre('save', function(next) {
  if (this.originalPrice && this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Stok durumu kontrolü
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Tam URL oluşturma
productSchema.virtual('fullImageUrl').get(function() {
  if (this.imageUrl.startsWith('http')) {
    return this.imageUrl;
  }
  return `${process.env.BASE_URL}/uploads/${this.imageUrl}`;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;