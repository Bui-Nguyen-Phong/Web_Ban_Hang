import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import placeholderImage from '../../assets/images/demo_8.jpg';

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // TODO: Hiển thị ảnh thực tế từ database
  // Ưu tiên: imageUrl > images[0] > placeholder
  
  const productImage = product.imageUrl || 
                       (product.images && product.images.length > 0 ? product.images[0] : null) ||
                       product.image_url || 
                       placeholderImage;

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-image-container">
          <img 
            src={productImage} 
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
          {product.stock === 0 && (
            <div className="out-of-stock-badge">Hết hàng</div>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <div className="low-stock-badge">Còn {product.stock}</div>
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-name" title={product.name}>
            {product.name}
          </h3>
          
          {product.category && (
            <span className="product-category">{product.category}</span>
          )}
          
          <p className="product-description">
            {product.description && product.description.length > 80
              ? `${product.description.substring(0, 80)}...`
              : product.description}
          </p>
          
          <div className="product-footer">
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.sellerName && (
              <span className="product-seller">
                <i>🏪</i> {product.sellerName}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
