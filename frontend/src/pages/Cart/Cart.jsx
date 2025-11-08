import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import './Cart.css';
import placeholderImage from '../../assets/images/demo_8.jpg';

function Cart() {
  const { cart, loading, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra authentication
  if (!isAuthenticated) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🔒</div>
          <h2>Vui lòng đăng nhập</h2>
          <p>Bạn cần đăng nhập để xem giỏ hàng</p>
          <Link to="/login" className="btn-continue-shopping">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleQuantityChange = (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemove = (itemId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      removeFromCart(itemId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">Đang tải giỏ hàng...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Link to="/products" className="btn-continue-shopping">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Giỏ hàng của bạn</h1>
        <span className="cart-count">{totalItems} sản phẩm</span>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          <div className="cart-actions-top">
            <Link to="/products" className="btn-continue">
              ← Tiếp tục mua sắm
            </Link>
            {cart.length > 0 && (
              <button onClick={handleClearCart} className="btn-clear-cart">
                Xóa giỏ hàng
              </button>
            )}
          </div>

          <div className="cart-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <Link to={`/products/${item.product.id}`}>
                    <img
                      src={item.product.imageUrl || item.product.image_url || placeholderImage}
                      alt={item.product.name}
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                  </Link>
                </div>

                <div className="item-info">
                  <Link to={`/products/${item.product.id}`} className="item-name">
                    {item.product.name}
                  </Link>
                  <div className="item-category">{item.product.category}</div>
                  {item.product.stock < 10 && item.product.stock > 0 && (
                    <div className="stock-warning">Chỉ còn {item.product.stock} sản phẩm</div>
                  )}
                  {item.product.stock === 0 && (
                    <div className="out-of-stock">Hết hàng</div>
                  )}
                </div>

                <div className="item-price">
                  <span className="price">{formatPrice(item.product.price)}</span>
                </div>

                <div className="item-quantity">
                  <button
                    className="qty-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value > 0) {
                        updateQuantity(item.id, value);
                      }
                    }}
                    min="1"
                    max={item.product.stock}
                  />
                  <button
                    className="qty-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  <span className="total-price">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>

                <div className="item-remove">
                  <button
                    className="btn-remove"
                    onClick={() => handleRemove(item.id)}
                    title="Xóa"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>Tóm tắt đơn hàng</h3>

            <div className="summary-row">
              <span>Tạm tính ({totalItems} sản phẩm)</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Tổng cộng</span>
              <span className="total-amount">{formatPrice(totalPrice)}</span>
            </div>

            <button className="btn-checkout" onClick={handleCheckout}>
              Thanh toán
            </button>

            <div className="payment-methods">
              <p>Hỗ trợ thanh toán:</p>
              <div className="payment-icons">
                <span>💳</span>
                <span>🏦</span>
                <span>💵</span>
              </div>
            </div>

            <div className="security-badge">
              <span>🔒</span>
              <span>Thanh toán an toàn & bảo mật</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
