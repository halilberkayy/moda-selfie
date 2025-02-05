import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('varsayılan yükleniyor mesajını göstermeli', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('özel mesajı göstermeli', () => {
    const customMessage = 'Fotoğraf yükleniyor...';
    render(<LoadingSpinner message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
}); 