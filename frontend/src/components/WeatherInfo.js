import React from 'react';

const WeatherInfo = ({ weather }) => {
  if (!weather) return null;

  return (
    <div className="weather-info">
      <div className="temperature">{weather.temperature}°C</div>
      <div className="condition">{weather.recommendation}</div>
    </div>
  );
};

export default WeatherInfo;