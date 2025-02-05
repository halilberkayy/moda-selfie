import React from 'react';

const ProductRecommendations = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="product-recommendations">
      <h2>Size Özel Öneriler</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations; 