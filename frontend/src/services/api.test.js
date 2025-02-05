import axios from 'axios';
import { getWeather, uploadPhoto, getRecommendations } from './api';

jest.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWeather', () => {
    it('hava durumu bilgisini başarıyla almalı', async () => {
      const mockWeather = { temperature: 20, condition: 'sunny' };
      axios.get.mockResolvedValueOnce({ data: mockWeather });

      const result = await getWeather();
      expect(result).toEqual(mockWeather);
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/api/weather');
    });

    it('hava durumu API hatası durumunda hata fırlatmalı', async () => {
      const error = new Error('API Hatası');
      axios.get.mockRejectedValueOnce(error);

      await expect(getWeather()).rejects.toThrow('API Hatası');
    });
  });

  describe('uploadPhoto', () => {
    it('fotoğrafı başarıyla yüklemeli', async () => {
      const mockResponse = { success: true, message: 'Fotoğraf yüklendi' };
      axios.post.mockResolvedValueOnce({ data: mockResponse });

      const photoData = 'base64-encoded-photo';
      const result = await uploadPhoto(photoData);

      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/api/analyze', { photo: photoData });
    });

    it('fotoğraf yükleme hatası durumunda hata fırlatmalı', async () => {
      const error = new Error('Yükleme Hatası');
      axios.post.mockRejectedValueOnce(error);

      const photoData = 'base64-encoded-photo';
      await expect(uploadPhoto(photoData)).rejects.toThrow('Yükleme Hatası');
    });
  });

  describe('getRecommendations', () => {
    it('ürün önerilerini başarıyla almalı', async () => {
      const mockRecommendations = [
        { id: 1, name: 'Ürün 1' },
        { id: 2, name: 'Ürün 2' }
      ];
      axios.post.mockResolvedValueOnce({ data: mockRecommendations });

      const tags = ['summer', 'casual'];
      const result = await getRecommendations(tags);

      expect(result).toEqual(mockRecommendations);
      expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/api/recommendations', { tags });
    });

    it('ürün önerileri API hatası durumunda hata fırlatmalı', async () => {
      const error = new Error('API Hatası');
      axios.post.mockRejectedValueOnce(error);

      const tags = ['summer', 'casual'];
      await expect(getRecommendations(tags)).rejects.toThrow('API Hatası');
    });
  });
}); 