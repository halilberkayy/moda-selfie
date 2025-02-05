import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import './ProductRecommendations.css';

const ProductRecommendations = ({ recommendations, weatherData }) => {
  const handleProductClick = (productUrl) => {
    // QR kod oluşturma ve gösterme işlemi burada yapılacak
    toast.info('QR kod oluşturuluyor...');
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendations-empty">
        <h3>Henüz Öneri Yok</h3>
        <p>Fotoğraf çekildiğinde size özel ürün önerileri burada görüntülenecek.</p>
      </div>
    );
  }

  const getWeatherMessage = () => {
    if (!weatherData) return '';
    
    const temp = weatherData.main.temp;
    const weather = weatherData.weather[0].main.toLowerCase();
    
    if (temp < 10) return 'Soğuk hava için ideal seçimler';
    if (temp > 25) return 'Sıcak hava için ferah öneriler';
    if (weather.includes('rain')) return 'Yağmurlu hava için uygun seçimler';
    return 'Sizin için seçtiğimiz ürünler';
  };

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h2>Önerilen Ürünler</h2>
        <p className="weather-context">{getWeatherMessage()}</p>
      </div>

      <div className="recommendations-grid">
        {recommendations.map((product) => (
          <div key={product.id} className="product-card" onClick={() => handleProductClick(product.url)}>
            <div className="product-image">
              <img src={product.imageUrl} alt={product.name} loading="lazy" />
              {product.discount && (
                <span className="discount-badge">%{product.discount}</span>
              )}
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-price">
                {product.originalPrice !== product.price && (
                  <span className="original-price">
                    {product.originalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                )}
                <span className="current-price">
                  {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
              <button className="view-product-button">
                Ürünü İncele
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="recommendations-footer">
        <p>Ürünleri incelemek için kartlara tıklayın</p>
        <small>Fiyatlar ve stok durumu anlık olarak değişebilir</small>
      </div>
    </div>
  );
};

ProductRecommendations.propTypes = {
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      originalPrice: PropTypes.number,
      discount: PropTypes.number,
      url: PropTypes.string.isRequired,
    })
  ),
  weatherData: PropTypes.shape({
    weather: PropTypes.arrayOf(
      PropTypes.shape({
        main: PropTypes.string.isRequired,
      })
    ).isRequired,
    main: PropTypes.shape({
      temp: PropTypes.number.isRequired,
    }).isRequired,
  }),
};

ProductRecommendations.defaultProps = {
  recommendations: [],
  weatherData: null,
};

export default ProductRecommendations;