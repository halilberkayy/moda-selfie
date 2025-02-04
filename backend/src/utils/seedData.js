require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const config = require('../config/config');

const sampleProducts = [
  {
    name: 'Klasik Trençkot',
    imageUrl: 'https://example.com/images/trenchcoat1.jpg',
    qrCodeUrl: 'https://example.com/qr/trenchcoat1',
    tags: ['trenchcoat', 'outerwear']
  },
  {
    name: 'Bej Trençkot',
    imageUrl: 'https://example.com/images/trenchcoat2.jpg',
    qrCodeUrl: 'https://example.com/qr/trenchcoat2',
    tags: ['trenchcoat', 'outerwear']
  },
  {
    name: 'Yazlık Elbise',
    imageUrl: 'https://example.com/images/dress1.jpg',
    qrCodeUrl: 'https://example.com/qr/dress1',
    tags: ['dress', 'summer']
  },
  {
    name: 'Spor Ayakkabı',
    imageUrl: 'https://example.com/images/sneakers1.jpg',
    qrCodeUrl: 'https://example.com/qr/sneakers1',
    tags: ['shoes', 'sneakers']
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut ürünleri temizle
    await Product.deleteMany({});
    console.log('Mevcut ürünler temizlendi');

    // Örnek ürünleri ekle
    await Product.insertMany(sampleProducts);
    console.log('Örnek ürünler eklendi');

    process.exit(0);
  } catch (error) {
    console.error('Veritabanı seed hatası:', error);
    process.exit(1);
  }
}

seedDatabase(); 