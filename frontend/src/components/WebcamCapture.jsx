import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

function WebcamCapture({ onCapture }) {
  const webcamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "user"
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown === 1) {
          capture();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(3);
  };

  const capture = useCallback(() => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Base64 formatında fotoğrafı localStorage'a kaydet
        localStorage.setItem('lastCapturedImage', imageSrc);
        onCapture(imageSrc);
        setIsCaptured(true);
        setError(null);
      } else {
        setError('Fotoğraf çekilemedi. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      console.error('Capture error:', err);
      setError('Fotoğraf çekilirken bir hata oluştu.');
    }
  }, [onCapture]);

  const handleRetake = () => {
    setIsCaptured(false);
    setCountdown(0);
    localStorage.removeItem('lastCapturedImage');
    onCapture(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-soft">
      <h2 className="text-lg font-bold mb-4">Fotoğraf Çek</h2>
      
      {error && (
        <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <div className="relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full rounded-lg"
        />
        
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-white bg-black bg-opacity-50 rounded-full w-24 h-24 flex items-center justify-center">
              {countdown}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        {!isCaptured ? (
          <button
            onClick={startCountdown}
            disabled={countdown > 0}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {countdown > 0 ? 'Hazırlanın...' : 'Fotoğraf Çek'}
          </button>
        ) : (
          <button
            onClick={handleRetake}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Tekrar Çek
          </button>
        )}
      </div>
    </div>
  );
}

export default WebcamCapture;
