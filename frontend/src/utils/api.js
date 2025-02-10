import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Sunucu hatası
      console.error('API Error:', error.response.data);
      if (error.response.status === 429) {
        alert('Çok fazla istek gönderildi. Lütfen biraz bekleyin.');
      }
    } else if (error.request) {
      // Sunucuya ulaşılamadı
      console.error('Network Error:', error.request);
      alert('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
    } else {
      // İstek oluşturulurken hata
      console.error('Request Error:', error.message);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
    return Promise.reject(error);
  }
);

export default api;
