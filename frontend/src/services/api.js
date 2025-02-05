import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Axios instance oluşturma
const api = axios.create({
  baseURL,
  timeout: 10000, // 10 saniye timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Yeniden deneme yapılandırması
const retryConfig = {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000, // Her denemede artan bekleme süresi
};

const handleApiError = (error) => {
  if (error.response) {
    // Sunucu yanıtı ile dönen hatalar (4xx, 5xx)
    throw new Error(`Sunucu Hatası: ${error.response.data.message || error.response.statusText}`);
  } else if (error.request) {
    // Yanıt alınamayan istekler
    throw new Error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.');
  } else {
    // İstek oluşturulurken oluşan hatalar
    throw new Error(`İstek Hatası: ${error.message}`);
  }
};

const retryRequest = async (apiCall) => {
  let lastError;
  for (let i = 0; i < retryConfig.retries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      if (i < retryConfig.retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay(i + 1)));
      }
    }
  }
  throw lastError;
};

export const getWeather = async () => {
  try {
    return await retryRequest(async () => {
      const response = await api.get('/api/weather');
      return response.data;
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const uploadPhoto = async (photoData) => {
  try {
    return await retryRequest(async () => {
      const response = await api.post('/api/analyze', { photo: photoData });
      return response.data;
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const getRecommendations = async (tags) => {
  try {
    return await retryRequest(async () => {
      const response = await api.post('/api/recommendations', { tags });
      return response.data;
    });
  } catch (error) {
    handleApiError(error);
  }
};