import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import './CameraCapture.css';

const CameraCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    // Kamera izni kontrolü
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setIsPermissionGranted(true);
        // Stream'i kapatıyoruz çünkü Webcam komponenti kendi stream'ini oluşturacak
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('Kamera erişim hatası:', err);
        setCameraError(err.message);
        setIsPermissionGranted(false);
      }
    };

    checkCameraPermission();
  }, []);

  const handleUserMedia = useCallback(() => {
    setIsPermissionGranted(true);
    setIsCameraReady(true);
    setCameraError(null);
  }, []);

  const handleUserMediaError = useCallback((err) => {
    console.error('Kamera erişim hatası:', err);
    setIsPermissionGranted(false);
    setCameraError(err.message);
    toast.error('Kamera erişimi reddedildi. Lütfen kamera izinlerini kontrol edin.');
  }, []);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      } else {
        toast.error('Fotoğraf çekilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Fotoğraf çekme hatası:', error);
      toast.error('Fotoğraf çekilirken bir hata oluştu.');
    }
  }, [onCapture]);

  const startCountdown = useCallback(() => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      capture();
    }, 3000);
  }, [capture]);

  const handleRetry = () => {
    // Sayfayı yenilemek yerine sadece kamera izinlerini tekrar kontrol ediyoruz
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        setIsPermissionGranted(true);
        setCameraError(null);
        setIsCameraReady(false);
      })
      .catch(err => {
        console.error('Kamera erişim hatası:', err);
        setCameraError(err.message);
        setIsPermissionGranted(false);
        toast.error('Kamera erişimi sağlanamadı. Lütfen tarayıcı ayarlarınızdan kamera izinlerini kontrol edin.');
      });
  };

  if (!isPermissionGranted || cameraError) {
    return (
      <div className="camera-permission">
        <div className="camera-permission-content">
          <h2>Kamera İzni Gerekli</h2>
          <p>Bu özelliği kullanmak için kamera izni vermeniz gerekmektedir.</p>
          {cameraError && (
            <p className="error-message">
              Hata: {cameraError}
            </p>
          )}
          <button 
            onClick={handleRetry}
            className="retry-button"
          >
            Tekrar Dene
          </button>
          <p className="help-text">
            Not: Tarayıcınızın adres çubuğundaki kamera izinlerini kontrol edin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container">
      <div className="camera-frame">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "user",
            aspectRatio: 16/9
          }}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          mirrored
        />
        {countdown && (
          <div className="countdown-overlay">
            <div className="countdown">{countdown}</div>
          </div>
        )}
      </div>
      
      {isCameraReady && !countdown && (
        <div className="camera-controls">
          <button 
            onClick={startCountdown}
            className="capture-button"
            aria-label="Fotoğraf Çek"
          >
            <span className="capture-button-inner" />
          </button>
        </div>
      )}
    </div>
  );
};

CameraCapture.propTypes = {
  onCapture: PropTypes.func.isRequired,
};

export default CameraCapture;