import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import './ProductDetail.css';
import placeholderImage from '../../assets/images/demo_8.jpg';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await productService.getProductById(id);
      setProduct(response.product || response.data);
    } catch (err) {
      setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
      console.error('Error fetching product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // TODO: Helper function để lấy ảnh từ nhiều nguồn
  const getProductImages = () => {
    // Ưu tiên: images array > imageUrl > image_url > placeholder
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (product.imageUrl) {
      return [product.imageUrl];
    }
    if (product.image_url) {
      return [product.image_url];
    }
    return [placeholderImage];
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product, quantity);
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      setQuantity(1); // Reset quantity
    } catch (error) {
      alert('Có lỗi khi thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (product.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng');
      return;
    }

    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    // Thêm vào giỏ và chuyển đến checkout
    try {
      await addToCart(product, quantity);
      navigate('/checkout');
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span> / </span>
        <Link to="/products">Sản phẩm</Link>
        <span> / </span>
        <span>{product.category}</span>
        <span> / </span>
        <span className="current">{product.name}</span>
      </div>

      <div className="product-detail-content">
        {/* Images Section - TODO: Hiển thị ảnh từ database */}
        <div className="product-images">
          <div className="main-image">
            <img
              src={getProductImages()[selectedImage]}
              alt={product.name}
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
          </div>
          {getProductImages().length > 1 && (
            <div className="image-thumbnails">
              {getProductImages().map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>

          {product.category && (
            <div className="product-category-badge">{product.category}</div>
          )}

          <div className="product-price-section">
            <span className="product-price">{formatPrice(product.price)}</span>
          </div>

          <div className="product-stock">
            {product.stock > 0 ? (
              <span className="in-stock">
                ✓ Còn hàng ({product.stock} sản phẩm)
              </span>
            ) : (
              <span className="out-of-stock">✗ Hết hàng</span>
            )}
          </div>

          <div className="product-description">
            <h3>Mô tả sản phẩm</h3>
            <p>{product.description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="quantity-section">
            <label>Số lượng:</label>
            <div className="quantity-controls">
              <button
                onClick={() => handleQuantityChange('decrease')}
                disabled={quantity <= 1}
                className="quantity-btn"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > 0 && val <= product.stock) {
                    setQuantity(val);
                  }
                }}
                className="quantity-input"
                min="1"
                max={product.stock}
              />
              <button
                onClick={() => handleQuantityChange('increase')}
                disabled={quantity >= product.stock}
                className="quantity-btn"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-add-to-cart"
            >
              🛒 Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn-buy-now"
            >
              Mua ngay
            </button>
          </div>

          {/* Seller Info */}
          {product.seller && (
            <div className="seller-info">
              <h4>Thông tin người bán</h4>
              <div className="seller-details">
                <p className="seller-name">🏪 {product.seller.name}</p>
                {product.seller.rating && (
                  <p className="seller-rating">⭐ {product.seller.rating}/5</p>
                )}
                {product.seller.totalProducts && (
                  <p className="seller-products">
                    📦 {product.seller.totalProducts} sản phẩm
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="additional-info">
        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="specifications-section">
            <h2>Thông số kỹ thuật</h2>
            <table className="specifications-table">
              <tbody>
                {product.specifications.map((spec, index) => (
                  <tr key={index}>
                    <td className="spec-label">{spec.label}</td>
                    <td className="spec-value">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Full Description */}
        {product.fullDescription && (
          <div className="full-description-section">
            <h2>Chi tiết sản phẩm</h2>
            <div
              className="full-description"
              dangerouslySetInnerHTML={{ __html: product.fullDescription }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
