import React, { useState, useEffect } from 'react';
import WeatherInfo from './components/WeatherInfo';
import CameraCapture from './components/CameraCapture';
import ProductRecommendations from './components/ProductRecommendations';
import * as api from './services/api';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [products, setProducts] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const weatherData = await api.getWeather();
        setWeather(weatherData);
      } catch (err) {
        console.error(err);
        setError('Hava durumu bilgisi alınamadı');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const handleCapture = async (photoData) => {
    try {
      setLoading(true);
      setError(null);
      const analysisData = await api.uploadPhoto(photoData);
      setAnalysis(analysisData);
      const recommendationsData = await api.getRecommendations(analysisData.tags);
      setProducts(recommendationsData.recommendations);
    } catch (err) {
      console.error(err);
      setError('Fotoğraf analizi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Moda Selfie Ayna</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">
            Yükleniyor...
          </div>
        ) : (
          <>
            {weather && <WeatherInfo weather={weather} />}
            {!showCamera && (
              <button 
                className="start-button"
                onClick={() => setShowCamera(true)}
              >
                Başla
              </button>
            )}
            {showCamera && <CameraCapture onCapture={handleCapture} />}
            {products.length > 0 && (
              <ProductRecommendations products={products} />
            )}
          </>
        )}
      </header>
    </div>
  );
}

export default App;
