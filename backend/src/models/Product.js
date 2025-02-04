const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  qrCodeUrl: { type: String, required: true },
  tags: [{ type: String }]
});

module.exports = mongoose.model('Product', ProductSchema);