import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

function WeatherDisplay({ onWeatherLoaded }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getWeather = async (position) => {
      try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const response = await api.get(`/weather?lat=${lat}&lon=${lon}`);
        setWeather(response.data);
        onWeatherLoaded(response.data);
        setError(null);
      } catch (err) {
        setError('Hava durumu alınamadı. Lütfen tekrar deneyin.');
        console.error('Weather error:', err);
      } finally {
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        getWeather,
        (err) => {
          setError('Konum bilgisi alınamadı. Lütfen konum erişimine izin verin.');
          setLoading(false);
          console.error('Geolocation error:', err);
        }
      );
    } else {
      setError('Tarayıcınız konum özelliğini desteklemiyor.');
    }
  }, [onWeatherLoaded]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">Hava Durumu</h2>
      <p>Sıcaklık: {weather.temperature} °C</p>
      <p>Nem: {weather.humidity} %</p>
      <p>Rüzgar: {weather.wind_speed} m/s</p>
    </div>
  );
}

export default WeatherDisplay;
