import React from 'react';

function ProductRecommendations({ products }) {
  return (
    <div className="product-recommendations">
      <h2>Önerilen Ürünler</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <h3>{product.name}</h3>
            <a 
              href={product.qrCodeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="product-link"
            >
              Ürünü Görüntüle (QR)
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductRecommendations; 