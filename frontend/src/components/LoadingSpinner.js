import React from 'react';

function LoadingSpinner({ message = 'Yükleniyor...' }) {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p className="spinner-text">{message}</p>
    </div>
  );
}

export default LoadingSpinner; 