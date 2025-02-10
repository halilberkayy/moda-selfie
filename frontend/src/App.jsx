import React, { useState } from 'react';
import KVKKConsent from './components/KVKKConsent';
import WebcamCapture from './components/WebcamCapture';
import WeatherDisplay from './components/WeatherDisplay';
import ProductSuggestions from './components/ProductSuggestions';
import VirtualTryOn from './components/VirtualTryOn';
import QRCodeDisplay from './components/QRCodeDisplay';

function App() {
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [photoData, setPhotoData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [virtualTryOnResult, setVirtualTryOnResult] = useState(null);
  const [qrData, setQrData] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-8">
        {!kvkkAccepted ? (
          <div className="max-w-md mx-auto">
            <KVKKConsent onAccept={() => setKvkkAccepted(true)} />
          </div>
        ) : (
          <>
            <header className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary-900 mb-2">Moda Aynası</h1>
              <p className="text-primary-600">Yapay zeka destekli kişisel moda asistanınız</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-soft p-6">
                  <WebcamCapture onCapture={setPhotoData} />
                </div>
                
                <div className="bg-white rounded-lg shadow-soft p-6">
                  <WeatherDisplay onWeatherLoaded={setWeatherData} />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-soft p-6">
                  <ProductSuggestions
                    photoData={photoData}
                    weatherData={weatherData}
                    onSuggestionsLoaded={setSuggestions}
                  />
                </div>
                
                {suggestions.length > 0 && (
                  <div className="bg-white rounded-lg shadow-soft p-6">
                    <VirtualTryOn
                      suggestions={suggestions}
                      onTryOnComplete={setVirtualTryOnResult}
                    />
                    {virtualTryOnResult && (
                      <div className="mt-4">
                        <img
                          src={virtualTryOnResult.virtual_image_url}
                          alt="Virtual Try-On Result"
                          className="rounded-lg shadow-md max-w-full h-auto"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {suggestions.length > 0 && (
                  <div className="bg-white rounded-lg shadow-soft p-6">
                    <QRCodeDisplay
                      productId={suggestions[0]?.id}
                      onQRGenerated={setQrData}
                    />
                    {qrData && (
                      <div className="mt-4 flex justify-center">
                        <img 
                          src={qrData} 
                          alt="QR Code" 
                          className="w-48 h-48"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
