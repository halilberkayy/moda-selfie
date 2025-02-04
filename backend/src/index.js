require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
const config = require('./config/config');
const { handleError } = require('./utils/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // fotoğraf gibi büyük payloadlar için

// API Routes
app.use('/api', apiRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `${req.originalUrl} bulunamadı`
  });
});

// Hata yönetimi
app.use(handleError);

// MongoDB bağlantısı
mongoose
  .connect(config.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    app.listen(config.PORT, () => console.log(`Sunucu ${config.PORT} portunda çalışıyor...`));
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
    process.exit(1);
  });