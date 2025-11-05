import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import './ProductDetail.css';

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
      // Mock data nếu API chưa có
      setProduct(getMockProduct(id));
    } finally {
      setLoading(false);
    }
  };

  const getMockProduct = (id) => {
    return {
      id: id,
      name: 'iPhone 15 Pro Max',
      description: 'iPhone 15 Pro Max là dòng iPhone cao cấp nhất với thiết kế titan chuẩn hàng không vũ trụ, chip A17 Pro mạnh mẽ, camera 48MP chuyên nghiệp với zoom quang học 5x.',
      fullDescription: `
        <h3>Thiết kế đột phá với titan</h3>
        <p>iPhone 15 Pro Max được chế tác từ titan chuẩn hàng không vũ trụ, mang đến sự bền bỉ vượt trội và trọng lượng siêu nhẹ. Viền mỏng hơn, màn hình lớn hơn.</p>
        
        <h3>Chip A17 Pro - Hiệu năng đỉnh cao</h3>
        <p>Chip A17 Pro 3nm mang đến hiệu năng GPU tăng 20%, CPU nhanh hơn 10%, xử lý mượt mà mọi tác vụ từ chơi game đến quay video 4K.</p>
        
        <h3>Hệ thống camera chuyên nghiệp</h3>
        <p>Camera chính 48MP với cảm biến lớn hơn, zoom quang học 5x, chế độ chụp chân dung thế hệ mới với điều chỉnh độ sâu trường ảnh sau khi chụp.</p>
        
        <h3>Màn hình Super Retina XDR</h3>
        <p>Màn hình OLED 6.7 inch với độ sáng tối đa 2000 nits, ProMotion 120Hz, Always-On Display, Dynamic Island.</p>
      `,
      price: 29990000,
      category: 'Điện thoại',
      stock: 15,
      images: [
        'https://via.placeholder.com/600x600?text=iPhone+15+Pro+Max',
        'https://via.placeholder.com/600x600?text=Camera',
        'https://via.placeholder.com/600x600?text=Design',
        'https://via.placeholder.com/600x600?text=Display',
      ],
      seller: {
        id: 1,
        name: 'Apple Store Official',
        rating: 4.9,
        totalProducts: 156,
      },
      specifications: [
        { label: 'Màn hình', value: '6.7 inch Super Retina XDR OLED' },
        { label: 'Chip', value: 'Apple A17 Pro (3nm)' },
        { label: 'RAM', value: '8GB' },
        { label: 'Dung lượng', value: '256GB / 512GB / 1TB' },
        { label: 'Camera sau', value: '48MP + 12MP + 12MP' },
        { label: 'Camera trước', value: '12MP' },
        { label: 'Pin', value: '4422 mAh' },
        { label: 'Hệ điều hành', value: 'iOS 17' },
      ],
    };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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
        {/* Images Section */}
        <div className="product-images">
          <div className="main-image">
            <img
              src={product.images && product.images[selectedImage]}
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
              }}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((img, index) => (
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
