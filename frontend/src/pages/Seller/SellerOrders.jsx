import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api';
import './SellerOrders.css';
import placeholderImage from '../../assets/images/demo_8.jpg';

const ORDER_STATUS = {
  pending: { label: 'Chờ xác nhận', color: '#ff9800', action: 'confirm' },
  paid: { label: 'Đã xác nhận', color: '#2196f3', action: 'ship' },
  shipped: { label: 'Đang giao', color: '#9c27b0', action: null },
  delivered: { label: 'Đã giao', color: '#4caf50', action: null },
  cancelled: { label: 'Đã hủy', color: '#f44336', action: null },
};

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await orderService.getSellerOrders(params);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đơn hàng');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    if (!window.confirm('Xác nhận đơn hàng này?')) return;

    setActionLoading({ ...actionLoading, [orderId]: true });
    try {
      await orderService.confirmOrder(orderId);
      alert('Đã xác nhận đơn hàng thành công!');
      loadOrders();
    } catch (err) {
      alert(err.message || 'Không thể xác nhận đơn hàng');
    } finally {
      setActionLoading({ ...actionLoading, [orderId]: false });
    }
  };

  const handleStartShipping = async (orderId) => {
    if (!window.confirm('Bắt đầu giao hàng?')) return;

    setActionLoading({ ...actionLoading, [orderId]: true });
    try {
      await orderService.startShipping(orderId);
      alert('Đã cập nhật trạng thái giao hàng!');
      loadOrders();
    } catch (err) {
      alert(err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setActionLoading({ ...actionLoading, [orderId]: false });
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Vui lòng nhập lý do hủy đơn:');
    if (!reason) return;

    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    setActionLoading({ ...actionLoading, [orderId]: true });
    try {
      await orderService.cancelOrderBySeller(orderId, reason);
      alert('Đã hủy đơn hàng thành công');
      loadOrders();
    } catch (err) {
      alert(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setActionLoading({ ...actionLoading, [orderId]: false });
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
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="seller-orders-container">
        <div className="loading">Đang tải đơn hàng...</div>
      </div>
    );
  }

  return (
    <div className="seller-orders-container">
      <h1>Quản lý đơn hàng</h1>

      <div className="orders-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Chờ xác nhận
        </button>
        <button
          className={filter === 'paid' ? 'active' : ''}
          onClick={() => setFilter('paid')}
        >
          Đã xác nhận
        </button>
        <button
          className={filter === 'shipped' ? 'active' : ''}
          onClick={() => setFilter('shipped')}
        >
          Đang giao
        </button>
        <button
          className={filter === 'delivered' ? 'active' : ''}
          onClick={() => setFilter('delivered')}
        >
          Đã giao
        </button>
        <button
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          Đã hủy
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
          <h2>Chưa có đơn hàng</h2>
          <p>
            {filter === 'all'
              ? 'Bạn chưa có đơn hàng nào'
              : `Không có đơn hàng nào ở trạng thái "${ORDER_STATUS[filter]?.label}"`}
          </p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const orderId = order.order_id || order.id;
            const orderDate = order.order_date || order.createdAt;
            const itemCount = order.sellerItemCount || order.itemCount || 0;
            const totalAmount = order.sellerTotalAmount || order.total_amount || 0;
            const isLoading = actionLoading[orderId];

            return (
              <div key={orderId} className="order-card">
                <div className="order-header">
                  <div className="order-info-header">
                    <div className="order-number">
                      Đơn hàng: <strong>ORD{orderId}</strong>
                    </div>
                    <div className="buyer-info">
                      Người mua: <strong>{order.buyer_name}</strong>
                      {order.buyer_phone && ` - ${order.buyer_phone}`}
                    </div>
                  </div>
                  <div
                    className="order-status"
                    style={{
                      background: ORDER_STATUS[order.status]?.color + '20',
                      color: ORDER_STATUS[order.status]?.color,
                    }}
                  >
                    {ORDER_STATUS[order.status]?.label}
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-info">
                    <div className="info-row">
                      <span className="label">Ngày đặt:</span>
                      <span>{formatDate(orderDate)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Số lượng sản phẩm của bạn:</span>
                      <span>{itemCount} sản phẩm</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Tổng tiền (sản phẩm của bạn):</span>
                      <span className="order-amount">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <Link to={`/seller/orders/${orderId}`} className="btn-view-detail">
                    Xem chi tiết
                  </Link>

                  {order.status === 'pending' && (
                    <>
                      <button
                        className="btn-confirm-order"
                        onClick={() => handleConfirmOrder(orderId)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Đang xử lý...' : 'Xác nhận đơn'}
                      </button>
                      <button
                        className="btn-cancel-order"
                        onClick={() => handleCancelOrder(orderId)}
                        disabled={isLoading}
                      >
                        Hủy đơn
                      </button>
                    </>
                  )}

                  {order.status === 'paid' && (
                    <>
                      <button
                        className="btn-start-shipping"
                        onClick={() => handleStartShipping(orderId)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Đang xử lý...' : 'Bắt đầu giao hàng'}
                      </button>
                      <button
                        className="btn-cancel-order"
                        onClick={() => handleCancelOrder(orderId)}
                        disabled={isLoading}
                      >
                        Hủy đơn
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SellerOrders;
