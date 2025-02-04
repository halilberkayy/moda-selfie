import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user"
};

function CameraCapture({ onCapture }) {
  const webcamRef = useRef(null);
  const [error, setError] = useState(null);

  const capturePhoto = useCallback(() => {
    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      
      if (!imageSrc) {
        throw new Error('Fotoğraf çekilemedi. Lütfen kamera erişimine izin verdiğinizden emin olun.');
      }

      onCapture(imageSrc);
    } catch (err) {
      console.error('Kamera hatası:', err);
      setError(err.message);
    }
  }, [onCapture]);

  const handleUserMediaError = useCallback((err) => {
    console.error('Kamera erişim hatası:', err);
    setError('Kameraya erişilemedi. Lütfen kamera izinlerini kontrol edin.');
  }, []);

  if (error) {
    return (
      <div className="camera-error">
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={() => setError(null)}
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="camera-capture">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        onUserMediaError={handleUserMediaError}
        className="webcam"
      />
      <button 
        className="capture-button"
        onClick={capturePhoto}
      >
        Fotoğraf Çek
      </button>
    </div>
  );
}

export default CameraCapture; 