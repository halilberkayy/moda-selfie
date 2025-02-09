import React from 'react';
import ReactWebcam from 'react-webcam';
import { useCamera } from '../hooks/useCamera';

const Camera: React.FC = () => {
  const { webcamRef, photo, takePhoto, resetPhoto, isLoading, error } = useCamera();

  const handleTakePhoto = async () => {
    await takePhoto();
  };

  return (
    <div className="camera-container">
      {!photo ? (
        <>
          <ReactWebcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: "user"
            }}
          />
          <button 
            onClick={handleTakePhoto}
            disabled={isLoading}
          >
            {isLoading ? 'Taking photo...' : 'Take Photo'}
          </button>
        </>
      ) : (
        <div className="photo-preview">
          <img src={photo} alt="Captured" />
          <button onClick={resetPhoto}>
            Retake Photo
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Camera;
