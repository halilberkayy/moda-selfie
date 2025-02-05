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
        setWeatherData(response.data);
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

  const getWeatherIcon = (weatherCode) => {
    const icons = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '☁️',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️'
    };
    return icons[weatherCode] || '🌡️';
  };

  return (
    <div className="weather-container">
      <div className="weather-icon">
        {getWeatherIcon(weatherData.weather[0].icon)}
      </div>
      <div className="weather-info">
        <div className="temperature">
          {Math.round(weatherData.main.temp)}°C
        </div>
        <div className="description">
          {weatherData.weather[0].description}
        </div>
        <div className="details">
          Nem: {weatherData.main.humidity}% | 
          Rüzgar: {Math.round(weatherData.wind.speed)} km/s
        </div>
      </div>
    </div>
  );
};

WeatherInfo.propTypes = {
  weatherData: PropTypes.shape({
    weather: PropTypes.arrayOf(
      PropTypes.shape({
        icon: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
      })
    ).isRequired,
    main: PropTypes.shape({
      temp: PropTypes.number.isRequired,
      humidity: PropTypes.number.isRequired,
    }).isRequired,
    wind: PropTypes.shape({
      speed: PropTypes.number.isRequired,
    }).isRequired,
  }),
  setWeatherData: PropTypes.func.isRequired,
};

export default WeatherInfo;