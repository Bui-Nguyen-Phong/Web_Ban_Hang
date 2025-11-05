import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api';
import './BuyerOrders.css';

const ORDER_STATUS = {
  pending: { label: 'Chờ xác nhận', color: '#ff9800' },
  confirmed: { label: 'Đã xác nhận', color: '#2196f3' },
  shipping: { label: 'Đang giao', color: '#9c27b0' },
  delivered: { label: 'Đã giao', color: '#4caf50' },
  cancelled: { label: 'Đã hủy', color: '#f44336' },
};

function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await orderService.getBuyerOrders(params);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
      // Mock data
      setOrders([
        {
          id: 1,
          orderNumber: 'ORD-2024-001',
          status: 'pending',
          totalAmount: 29990000,
          itemCount: 2,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          orderNumber: 'ORD-2024-002',
          status: 'delivered',
          totalAmount: 15000000,
          itemCount: 1,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      await orderService.cancelOrder(orderId, 'Khách hàng hủy đơn');
      alert('Hủy đơn hàng thành công');
      loadOrders();
    } catch (err) {
      alert(err.message || 'Không thể hủy đơn hàng');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="buyer-orders-container">
        <div className="loading">Đang tải đơn hàng...</div>
      </div>
    );
  }

  return (
    <div className="buyer-orders-container">
      <h1>Đơn hàng của tôi</h1>

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
          className={filter === 'confirmed' ? 'active' : ''}
          onClick={() => setFilter('confirmed')}
        >
          Đã xác nhận
        </button>
        <button
          className={filter === 'shipping' ? 'active' : ''}
          onClick={() => setFilter('shipping')}
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
          <p>Bạn chưa có đơn hàng nào</p>
          <Link to="/products" className="btn-shop-now">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-number">
                  Đơn hàng: <strong>{order.orderNumber}</strong>
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
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Số lượng:</span>
                    <span>{order.itemCount} sản phẩm</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Tổng tiền:</span>
                    <span className="order-amount">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-actions">
                <Link to={`/orders/${order.id}`} className="btn-view-detail">
                  Xem chi tiết
                </Link>
                {order.status === 'pending' && (
                  <button
                    className="btn-cancel-order"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Hủy đơn
                  </button>
                )}
                {order.status === 'delivered' && (
                  <button className="btn-reorder">Mua lại</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerOrders;
