import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/api';
import './Checkout.css';
import placeholderImage from '../../assets/images/demo_8.jpg';

function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra authentication
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Kiểm tra giỏ hàng trống
  if (!cart || cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: '',
    district: '',
    ward: '',
    note: '',
    paymentMethod: 'cod',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shippingFee = 0; // Miễn phí ship
  const totalAmount = totalPrice + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate
      if (!formData.fullName || !formData.phone || !formData.address) {
        throw new Error('Vui lòng điền đầy đủ thông tin giao hàng');
      }

      // Prepare order data
      const orderData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
        },
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        totalAmount,
        shippingFee,
      };

      const result = await orderService.createOrder(orderData);
      
      // Clear cart after successful order
      await clearCart();

      alert('Đặt hàng thành công!');
      navigate(`/orders/${result.orderId || result.id}`);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <h2>Giỏ hàng trống</h2>
          <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <button onClick={() => navigate('/products')} className="btn-back-shopping">
            Quay lại mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Thanh toán</h1>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="checkout-content">
          <div className="checkout-left">
            {/* Shipping Information */}
            <div className="checkout-section">
              <h2>Thông tin giao hàng</h2>

              <div className="form-group">
                <label htmlFor="fullName">
                  Họ và tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    Số điện thoại <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  Địa chỉ <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số nhà, tên đường"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">Tỉnh/Thành phố</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Tỉnh/Thành phố"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="district">Quận/Huyện</label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Quận/Huyện"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ward">Phường/Xã</label>
                  <input
                    type="text"
                    id="ward"
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    placeholder="Phường/Xã"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="note">Ghi chú đơn hàng</label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng"
                  rows="3"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h2>Phương thức thanh toán</h2>

              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  <div className="payment-option-content">
                    <span className="payment-icon">💵</span>
                    <div>
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                      <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleChange}
                  />
                  <div className="payment-option-content">
                    <span className="payment-icon">🏦</span>
                    <div>
                      <strong>Chuyển khoản ngân hàng</strong>
                      <p>Chuyển khoản qua ngân hàng</p>
                    </div>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={formData.paymentMethod === 'credit_card'}
                    onChange={handleChange}
                  />
                  <div className="payment-option-content">
                    <span className="payment-icon">💳</span>
                    <div>
                      <strong>Thẻ tín dụng/Ghi nợ</strong>
                      <p>Thanh toán qua cổng thanh toán</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="checkout-right">
            <div className="order-summary">
              <h2>Đơn hàng ({cart.length} sản phẩm)</h2>

              <div className="order-items">
                {cart.map((item) => (
                  <div key={item.id} className="order-item">
                    <img
                      src={item.product.imageUrl || item.product.image_url || placeholderImage}
                      alt={item.product.name}
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                    <div className="order-item-info">
                      <div className="order-item-name">{item.product.name}</div>
                      <div className="order-item-qty">x{item.quantity}</div>
                    </div>
                    <div className="order-item-price">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="order-total-row">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="order-total-row">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                </div>
                <div className="order-total-divider"></div>
                <div className="order-total-row total">
                  <span>Tổng cộng</span>
                  <span className="total-amount">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn-place-order" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>

              <div className="checkout-security">
                <span>🔒</span>
                <span>Giao dịch an toàn và bảo mật</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Checkout;
