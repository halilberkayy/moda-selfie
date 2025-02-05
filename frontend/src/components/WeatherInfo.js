import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';
import './WeatherInfo.css';

const WeatherInfo = ({ weatherData, setWeatherData }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/weather`);
        setWeatherData(response.data.data);
      } catch (error) {
        console.error('Hava durumu bilgisi alınamadı:', error);
        toast.error('Hava durumu bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [setWeatherData]);

  if (loading) {
    return (
      <div className="weather-loading">
        <div className="weather-loading-indicator" />
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const getWeatherIcon = (description) => {
    const icons = {
      'açık': '☀️',
      'parçalı bulutlu': '⛅',
      'bulutlu': '☁️',
      'kapalı': '☁️',
      'yağmurlu': '🌧️',
      'sağanak yağışlı': '🌧️',
      'karlı': '❄️',
      'sisli': '🌫️'
    };
    return icons[description.toLowerCase()] || '🌡️';
  };

  return (
    <div className="weather-container">
      <div className="weather-icon">
        {getWeatherIcon(weatherData.description)}
      </div>
      <div className="weather-info">
        <div className="temperature">
          {weatherData.temperature}°C
        </div>
        <div className="description">
          {weatherData.description}
        </div>
        <div className="details">
          Nem: {weatherData.humidity}% | 
          Rüzgar: {Math.round(weatherData.windSpeed)} km/s
        </div>
      </div>
    </div>
  );
};

WeatherInfo.propTypes = {
  weatherData: PropTypes.shape({
    temperature: PropTypes.number,
    humidity: PropTypes.number,
    windSpeed: PropTypes.number,
    description: PropTypes.string,
    location: PropTypes.string,
  }),
  setWeatherData: PropTypes.func.isRequired,
};

export default WeatherInfo;