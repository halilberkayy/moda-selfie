import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

function ProductSuggestions({ photoData, weatherData, onSuggestionsLoaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const analyzeImage = async () => {
      if (!photoData) return;
      
      setLoading(true);
      try {
        const response = await api.post("/analyze", {
          image: photoData,
        });
        
        // Hava durumuna göre önerileri filtrele
        let filteredSuggestions = response.data.suggestions;
        if (weatherData) {
          const temp = weatherData.temperature;
          filteredSuggestions = filteredSuggestions.filter(item => {
            if (temp < 15) {
              return !['tshirt', 'shorts'].includes(item.type);
            } else if (temp > 25) {
              return !['coat', 'sweater'].includes(item.type);
            }
            return true;
          });
        }

        setSuggestions(filteredSuggestions);
        onSuggestionsLoaded(filteredSuggestions);
        setError(null);
      } catch (error) {
        console.error("Fotoğraf analizi yapılamadı:", error);
        setError("Ürün önerileri alınamadı. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };

    if (photoData) {
      analyzeImage();
    }
  }, [photoData, weatherData, onSuggestionsLoaded]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-soft">
        <h2 className="text-lg font-bold mb-4">Ürün Önerileri</h2>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-soft">
        <h2 className="text-lg font-bold mb-4">Ürün Önerileri</h2>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-soft">
      <h2 className="text-lg font-bold mb-4">Ürün Önerileri</h2>
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {suggestions.map((item) => (
            <div 
              key={item.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-md mb-2"
                />
              )}
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.color}</p>
              {weatherData && (
                <div className="mt-2 text-xs text-primary-600">
                  {weatherData.temperature}°C için uygun
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Henüz fotoğraf çekilmedi veya analiz edilmedi.</p>
      )}
    </div>
  );
}

export default ProductSuggestions;
