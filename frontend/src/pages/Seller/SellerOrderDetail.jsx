import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/api';
import '../Buyer/OrderDetail.css';
import placeholderImage from '../../assets/images/demo_8.jpg';

const ORDER_STATUS = {
  pending: { label: 'Chờ xác nhận', color: '#ff9800' },
  paid: { label: 'Đã xác nhận', color: '#2196f3' },
  shipped: { label: 'Đang giao', color: '#9c27b0' },
  delivered: { label: 'Đã giao', color: '#4caf50' },
  cancelled: { label: 'Đã hủy', color: '#f44336' },
};

function SellerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrderDetail();
  }, [id]);

  const loadOrderDetail = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Không thể tải chi tiết đơn hàng');
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!window.confirm('Xác nhận đơn hàng này?')) return;

    setActionLoading(true);
    try {
      await orderService.confirmOrder(id);
      alert('Đã xác nhận đơn hàng thành công!');
      loadOrderDetail();
    } catch (err) {
      alert(err.message || 'Không thể xác nhận đơn hàng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartShipping = async () => {
    if (!window.confirm('Bắt đầu giao hàng?')) return;

    setActionLoading(true);
    try {
      await orderService.startShipping(id);
      alert('Đã cập nhật trạng thái giao hàng!');
      loadOrderDetail();
    } catch (err) {
      alert(err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt('Vui lòng nhập lý do hủy đơn:');
    if (!reason) return;

    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    setActionLoading(true);
    try {
      await orderService.cancelOrderBySeller(id, reason);
      alert('Đã hủy đơn hàng thành công');
      loadOrderDetail();
    } catch (err) {
      alert(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseShippingAddress = (address) => {
    if (!address) return null;
    
    try {
      if (typeof address === 'string') {
        return JSON.parse(address);
      }
      return address;
    } catch (err) {
      console.error('Error parsing shipping address:', err);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="loading">Đang tải chi tiết đơn hàng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/seller/orders')} className="btn-back">
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <div className="error-message">Không tìm thấy đơn hàng</div>
        <button onClick={() => navigate('/seller/orders')} className="btn-back">
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  const shippingAddress = parseShippingAddress(order.shipping_address);
  const items = order.items || [];

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <button onClick={() => navigate('/seller/orders')} className="btn-back">
          ← Quay lại
        </button>
        <h1>Chi tiết đơn hàng</h1>
      </div>

      <div className="order-detail-content">
        {/* Order Status Section */}
        <div className="order-status-section">
          <div className="status-badge" style={{
            background: ORDER_STATUS[order.status]?.color + '20',
            color: ORDER_STATUS[order.status]?.color,
          }}>
            {ORDER_STATUS[order.status]?.label || order.status}
          </div>
          <div className="order-number">
            Mã đơn hàng: <strong>ORD{id}</strong>
          </div>
          <div className="order-date">
            Ngày đặt: {formatDate(order.order_date || order.createdAt)}
          </div>
        </div>

        {/* Buyer Info Section */}
        <div className="detail-section">
          <h2>Thông tin người mua</h2>
          <div className="info-box">
            <div className="info-row">
              <span className="label">Tên:</span>
              <span>{order.buyer_name}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span>{order.buyer_email}</span>
            </div>
            <div className="info-row">
              <span className="label">Số điện thoại:</span>
              <span>{order.buyer_phone}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address Section */}
        <div className="detail-section">
          <h2>Địa chỉ giao hàng</h2>
          <div className="info-box">
            {shippingAddress ? (
              <>
                <div className="info-row">
                  <span className="label">Người nhận:</span>
                  <span>{shippingAddress.fullName || shippingAddress.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Số điện thoại:</span>
                  <span>{shippingAddress.phone || shippingAddress.phoneNumber}</span>
                </div>
                <div className="info-row">
                  <span className="label">Địa chỉ:</span>
                  <span>
                    {shippingAddress.address}
                    {shippingAddress.ward && `, ${shippingAddress.ward}`}
                    {shippingAddress.district && `, ${shippingAddress.district}`}
                    {shippingAddress.city && `, ${shippingAddress.city}`}
                  </span>
                </div>
                {shippingAddress.note && (
                  <div className="info-row">
                    <span className="label">Ghi chú:</span>
                    <span>{shippingAddress.note}</span>
                  </div>
                )}
              </>
            ) : (
              <p>Không có thông tin địa chỉ giao hàng</p>
            )}
          </div>
        </div>

        {/* Order Items Section */}
        <div className="detail-section">
          <h2>Sản phẩm trong đơn hàng</h2>
          <div className="items-list">
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.order_item_id} className="item-card">
                  <div className="item-image">
                    <img 
                      src={item.product_image || placeholderImage} 
                      alt={item.product_name}
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                  </div>
                  <div className="item-info">
                    <div className="item-name">{item.product_name}</div>
                    <div className="item-seller">
                      Mã sản phẩm: #{item.product_id}
                    </div>
                  </div>
                  <div className="item-quantity">x{item.quantity}</div>
                  <div className="item-price">{formatPrice(item.product_price)}</div>
                  <div className="item-subtotal">
                    {formatPrice(item.subtotal || item.product_price * item.quantity)}
                  </div>
                </div>
              ))
            ) : (
              <p>Không có sản phẩm nào trong đơn hàng</p>
            )}
          </div>
        </div>

        {/* Payment Summary Section */}
        <div className="detail-section">
          <h2>Tổng quan thanh toán</h2>
          <div className="payment-summary">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>
                {formatPrice(
                  items.reduce((sum, item) => sum + (item.subtotal || item.product_price * item.quantity), 0)
                )}
              </span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{formatPrice(30000)}</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span className="total-amount">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-actions">
          {order.status === 'pending' && (
            <>
              <button 
                className="btn-confirm-delivery" 
                onClick={handleConfirmOrder}
                disabled={actionLoading}
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận đơn hàng'}
              </button>
              <button 
                className="btn-cancel-order" 
                onClick={handleCancelOrder}
                disabled={actionLoading}
              >
                Hủy đơn hàng
              </button>
            </>
          )}
          {order.status === 'paid' && (
            <>
              <button 
                className="btn-confirm-delivery" 
                onClick={handleStartShipping}
                disabled={actionLoading}
              >
                {actionLoading ? 'Đang xử lý...' : 'Bắt đầu giao hàng'}
              </button>
              <button 
                className="btn-cancel-order" 
                onClick={handleCancelOrder}
                disabled={actionLoading}
              >
                Hủy đơn hàng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerOrderDetail;
