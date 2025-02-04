import React, { useState, useEffect } from 'react';
import WeatherInfo from './components/WeatherInfo';
import CameraCapture from './components/CameraCapture';
import ProductRecommendations from './components/ProductRecommendations';
import api from './services/api';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [products, setProducts] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hava durumu bilgisini backend'den çek
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/weather');
        setWeather(res.data);
      } catch (err) {
        console.error(err);
        setError('Hava durumu bilgisi alınamadı');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  // Kamera ile fotoğraf çekildiğinde çağrılacak fonksiyon
  const handleCapture = async (photoData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/analyze', { photo: photoData });
      setAnalysis(res.data.analysis);
      // Önerilen tag üzerinden ürünleri çekelim
      const tag = res.data.analysis.recommendedTag;
      const prodRes = await api.get(`/products?tag=${tag}`);
      setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
      setError('Fotoğraf analizi veya ürün önerileri alınamadı');
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
