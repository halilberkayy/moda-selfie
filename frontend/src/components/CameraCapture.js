import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './CameraCapture.css';

const CameraCapture = ({ onCapture }) => {
  const [error, setError] = useState(null);
  const webcamRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const handleCapture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      } else {
        setError('Fotoğraf çekilemedi. Lütfen tekrar deneyin.');
      }
    }
  }, [onCapture]);

  const handleUserMediaError = useCallback((err) => {
    console.error('Kamera erişim hatası:', err);
    setError(
      'Kamera erişimi sağlanamadı. Lütfen kamera izinlerinizi kontrol edin ve tarayıcınızın kamera erişimine izin verdiğinizden emin olun.'
    );
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
  }, []);

  const handleUserMedia = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  if (error) {
    return (
      <div className="camera-error">
        <p>{error}</p>
        <button className="retry-button" onClick={handleRetry}>
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="camera-container">
      {isLoading && <div className="loading">Kamera başlatılıyor...</div>}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        onUserMediaError={handleUserMediaError}
        onUserMedia={handleUserMedia}
        className="webcam"
        data-testid="mock-webcam"
      />
      <button 
        className="capture-button"
        onClick={handleCapture}
        disabled={isLoading || error}
      >
        Fotoğraf Çek
      </button>
    </div>
  );
};

export default CameraCapture; 