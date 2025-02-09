import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { CameraHookState } from '../types';

export const useCamera = (): CameraHookState => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    let mounted = true;

    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (!mounted) return;
        
        setHasCamera(videoDevices.length > 0);
        if (videoDevices.length === 0) {
          setError('Bu cihazda kamera bulunamadı. Lütfen kamera bağlantınızı kontrol edin.');
        }
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Kamera kontrolü başarısız oldu';
        setError(`Kamera erişimi sağlanamadı: ${errorMessage}`);
        setHasCamera(false);
        console.error('Camera check error:', err);
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', checkCamera);
    checkCamera();

    return () => {
      mounted = false;
      navigator.mediaDevices.removeEventListener('devicechange', checkCamera);
    };
  }, []);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    try {
      if (!hasCamera) {
        throw new Error('Kamera kullanılamıyor');
      }

      setIsLoading(true);
      setError(null);

      if (!webcamRef.current) {
        throw new Error('Kamera başlatılamadı');
      }

      const photoData = webcamRef.current.getScreenshot();
      if (!photoData) {
        throw new Error('Fotoğraf çekilemedi');
      }

      setPhoto(photoData);
      return photoData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fotoğraf çekilemedi';
      setError(errorMessage);
      console.error('Camera error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [hasCamera]);

  const resetPhoto = useCallback(() => {
    setPhoto(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    photo,
    takePhoto,
    resetPhoto,
    webcamRef,
    hasCamera
  };
};
