import React, { useState } from 'react';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

function VirtualTryOn({ suggestions, onTryOnComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleTryOn = async (item) => {
    setLoading(true);
    setError(null);
    setSelectedItem(item);

    try {
      // Kolors API'ye gönderilecek payload
      const payload = {
        model_name: "kolors-virtual-try-on-v1",
        human_image: localStorage.getItem('lastCapturedImage'), // WebcamCapture'dan alınan son fotoğraf
        cloth_image: item.image_url,
      };

      const response = await api.post("/images/kolors-virtual-try-on", payload);
      onTryOnComplete(response.data);
      setError(null);
    } catch (error) {
      console.error("Virtual Try-On hatası:", error);
      setError("Sanal deneme sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-soft">
      <h2 className="text-lg font-bold mb-4">Sanal Deneme</h2>
      
      {error && (
        <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        {suggestions.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTryOn(item)}
            disabled={loading}
            className={`
              p-4 rounded-lg border transition-all
              ${selectedItem?.id === item.id 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-primary-300'}
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
            )}
            <div className="text-sm font-medium">{item.name}</div>
            <div className="text-xs text-gray-600">{item.color}</div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center p-4">
          <LoadingSpinner />
          <span className="ml-2">Sanal deneme hazırlanıyor...</span>
        </div>
      )}
    </div>
  );
}

export default VirtualTryOn;
