import React from 'react';

function WeatherInfo({ weather }) {
  return (
    <div className="weather-info">
      <div className="weather-header">
        <img src={weather.icon} alt={weather.condition} className="weather-icon" />
        <div className="weather-main">
          <h2>Güncel Hava Durumu</h2>
          <p className="temperature">{weather.temperature}°C</p>
        </div>
      </div>
      <div className="weather-details">
        <div className="weather-detail">
          <span className="label">Durum:</span>
          <span className="value">{weather.condition}</span>
        </div>
        <div className="weather-detail">
          <span className="label">Hissedilen:</span>
          <span className="value">{weather.feelsLike}°C</span>
        </div>
        <div className="weather-detail">
          <span className="label">Nem:</span>
          <span className="value">%{weather.humidity}</span>
        </div>
      </div>
    </div>
  );
}

export default WeatherInfo;