import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CameraCapture from './CameraCapture';

const mockWebcam = jest.fn();

jest.mock('react-webcam', () => {
  return function MockWebcam(props) {
    mockWebcam(props);
    return (
      <div data-testid="mock-webcam">
        <button onClick={() => props.onUserMediaError(new Error('Camera error'))}>
          Trigger Error
        </button>
        <button onClick={() => props.onUserMedia()}>
          Start Camera
        </button>
      </div>
    );
  };
});

describe('CameraCapture', () => {
  const mockOnCapture = jest.fn();

  beforeEach(() => {
    mockOnCapture.mockClear();
    mockWebcam.mockClear();
  });

  it('kamera görüntüsünü ve çekim butonunu göstermeli', () => {
    render(<CameraCapture onCapture={mockOnCapture} />);
    
    expect(screen.getByTestId('mock-webcam')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fotoğraf Çek' })).toBeInTheDocument();
  });

  it('kamera hatası olduğunda hata mesajını göstermeli', () => {
    render(<CameraCapture onCapture={mockOnCapture} />);
    
    fireEvent.click(screen.getByText('Trigger Error'));
    
    expect(screen.getByText('Kamera erişimi sağlanamadı')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tekrar Dene' })).toBeInTheDocument();
  });

  it('fotoğraf çekildiğinde onCapture fonksiyonunu çağırmalı', () => {
    render(<CameraCapture onCapture={mockOnCapture} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Fotoğraf Çek' }));
    
    expect(mockOnCapture).toHaveBeenCalledWith('test-image-data');
  });

  it('tekrar dene butonuna tıklandığında kamerayı yeniden başlatmalı', () => {
    render(<CameraCapture onCapture={mockOnCapture} />);
    
    fireEvent.click(screen.getByText('Trigger Error'));
    expect(screen.getByText('Kamera erişimi sağlanamadı')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar Dene' }));
    
    expect(screen.getByTestId('mock-webcam')).toBeInTheDocument();
  });
}); 