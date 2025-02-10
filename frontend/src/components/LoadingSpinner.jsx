import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2">Yükleniyor...</span>
    </div>
  );
}

export default LoadingSpinner;
