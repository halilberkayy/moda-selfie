import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WeatherInfo from './components/WeatherInfo';
import CameraCapture from './components/CameraCapture';
import ProductRecommendations from './components/ProductRecommendations';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    document.title = 'Moda Selfie Aynası';
  }, []);

  const handleImageCapture = async (image) => {
    setCapturedImage(image);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.recommendations) {
        setRecommendations(response.data.recommendations);
        toast.success('Fotoğrafınız başarıyla analiz edildi!');
      } else {
        toast.warning('Üzgünüz, fotoğrafınıza uygun ürün bulunamadı.');
      }
    } catch (error) {
      console.error('Fotoğraf analizi sırasında hata:', error);
      toast.error('Fotoğraf analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setCapturedImage(null);
    setRecommendations([]);
  };

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={5000} />
      <header className="app-header">
        <h1>Moda Selfie Aynası</h1>
        <WeatherInfo weatherData={weatherData} setWeatherData={setWeatherData} />
      </header>

      <main className="app-main">
        {loading ? (
          <LoadingSpinner message="Fotoğrafınız analiz ediliyor..." />
        ) : (
          <>
            {!capturedImage ? (
              <CameraCapture onCapture={handleImageCapture} />
            ) : (
              <div className="results-container">
                <div className="captured-image-container">
                  <img src={capturedImage} alt="Çekilen fotoğraf" className="captured-image" />
                  <button onClick={resetApp} className="reset-button">
                    Yeni Fotoğraf Çek
                  </button>
                </div>
                <ProductRecommendations 
                  recommendations={recommendations}
                  weatherData={weatherData}
                />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2024 Moda Selfie Aynası - Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}

export default App;