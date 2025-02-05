import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { getWeather, uploadPhoto, getRecommendations } from './services/api';

// Mock API calls
jest.mock('./services/api');

// Mock CameraCapture component
jest.mock('./components/CameraCapture', () => {
  return function MockCameraCapture({ onCapture }) {
    return (
      <div data-testid="webcam">
        <button onClick={() => onCapture('test-photo-data')}>
          Fotoğraf Çek
        </button>
      </div>
    );
  };
});

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('başlangıçta hava durumu bilgisini göstermeli', async () => {
    const mockWeather = {
      temperature: 20,
      condition: 'sunny',
      recommendation: 'Güneşli bir gün'
    };

    getWeather.mockResolvedValueOnce(mockWeather);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('20°C')).toBeInTheDocument();
      expect(screen.getByText('Güneşli bir gün')).toBeInTheDocument();
    });
  });

  it('hava durumu API hatası durumunda hata mesajı göstermeli', async () => {
    getWeather.mockRejectedValueOnce(new Error('API Hatası'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Hava durumu bilgisi alınamadı')).toBeInTheDocument();
    });
  });

  it('başla butonuna tıklandığında kamerayı göstermeli', async () => {
    getWeather.mockResolvedValueOnce({
      temperature: 20,
      condition: 'sunny',
      recommendation: 'Güneşli bir gün'
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Başla')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Başla'));
    expect(screen.getByTestId('webcam')).toBeInTheDocument();
  });

  it('fotoğraf çekildiğinde analiz ve ürün önerileri göstermeli', async () => {
    const mockAnalysis = {
      tags: ['summer', 'casual']
    };

    const mockProducts = {
      recommendations: [
        { id: 1, name: 'Ürün 1', imageUrl: 'test1.jpg' },
        { id: 2, name: 'Ürün 2', imageUrl: 'test2.jpg' }
      ]
    };

    getWeather.mockResolvedValueOnce({
      temperature: 20,
      condition: 'sunny',
      recommendation: 'Güneşli bir gün'
    });
    uploadPhoto.mockResolvedValueOnce(mockAnalysis);
    getRecommendations.mockResolvedValueOnce(mockProducts);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Başla')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Başla'));
    fireEvent.click(screen.getByText('Fotoğraf Çek'));

    await waitFor(() => {
      expect(screen.getByText('Ürün 1')).toBeInTheDocument();
      expect(screen.getByText('Ürün 2')).toBeInTheDocument();
    });
  });
});
