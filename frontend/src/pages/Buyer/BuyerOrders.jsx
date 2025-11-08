import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService, cartService } from '../../services/api';
import './BuyerOrders.css';
import placeholderImage from '../../assets/images/demo_8.jpg';

const ORDER_STATUS = {
  pending: { label: 'Chờ xác nhận', color: '#ff9800' },
  paid: { label: 'Đã thanh toán', color: '#2196f3' },
  shipped: { label: 'Đang giao', color: '#9c27b0' },
  delivered: { label: 'Đã giao', color: '#4caf50' },
  cancelled: { label: 'Đã hủy', color: '#f44336' },
};

function BuyerOrders() {
  const navigate = useNavigate();
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
    const reason = prompt('Vui lòng nhập lý do hủy đơn (không bắt buộc):');
    if (reason === null) return; // User clicked Cancel

    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      await orderService.cancelOrder(orderId, reason || 'Người mua hủy đơn');
      alert('Hủy đơn hàng thành công');
      loadOrders();
    } catch (err) {
      alert(err.message || 'Không thể hủy đơn hàng');
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    if (!window.confirm('Xác nhận bạn đã nhận được hàng?')) return;

    try {
      await orderService.confirmDelivery(orderId);
      alert('Xác nhận nhận hàng thành công!');
      loadOrders();
    } catch (err) {
      alert(err.message || 'Không thể xác nhận nhận hàng');
    }
  };

  const handleReorder = async (orderId) => {
    if (!window.confirm('Thêm lại tất cả sản phẩm trong đơn hàng này vào giỏ hàng?')) return;

    try {
      // Lấy chi tiết đơn hàng
      const orderDetail = await orderService.getOrderById(orderId);
      
      if (!orderDetail.items || orderDetail.items.length === 0) {
        alert('Đơn hàng này không có sản phẩm');
        return;
      }

      // Thêm từng sản phẩm vào giỏ hàng
      let addedCount = 0;
      let failedProducts = [];

      for (const item of orderDetail.items) {
        try {
          await cartService.addToCart(item.product_id, item.quantity);
          addedCount++;
        } catch (err) {
          failedProducts.push(item.product_name);
          console.error(`Failed to add ${item.product_name}:`, err);
        }
      }

      if (addedCount > 0) {
        if (failedProducts.length > 0) {
          alert(`Đã thêm ${addedCount} sản phẩm vào giỏ hàng.\n\nKhông thể thêm: ${failedProducts.join(', ')}`);
        } else {
          alert(`Đã thêm ${addedCount} sản phẩm vào giỏ hàng thành công!`);
        }
        // Chuyển đến trang giỏ hàng
        navigate('/cart');
      } else {
        alert('Không thể thêm sản phẩm nào vào giỏ hàng. Có thể sản phẩm đã hết hàng hoặc không còn bán.');
      }
    } catch (err) {
      alert(err.message || 'Không thể mua lại đơn hàng');
      console.error('Reorder error:', err);
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
          className={filter === 'paid' ? 'active' : ''}
          onClick={() => setFilter('paid')}
        >
          Đã thanh toán
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
          <p>Bạn chưa có đơn hàng nào</p>
          <Link to="/products" className="btn-shop-now">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const orderId = order.order_id || order.id;
            const orderDate = order.order_date || order.createdAt;
            const orderAmount = order.total_amount || order.totalAmount;
            const itemCount = order.itemCount || 0;
            
            return (
            <div key={orderId} className="order-card">
              <div className="order-header">
                <div className="order-number">
                  Đơn hàng: <strong>ORD{orderId}</strong>
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
                {/* Product Preview Images */}
                {order.previewItems && order.previewItems.length > 0 && (
                  <div className="order-products-preview">
                    {order.previewItems.map((item, index) => (
                      <div key={index} className="preview-image">
                        <img 
                          src={item.product_image || placeholderImage} 
                          alt={item.product_name}
                          onError={(e) => {
                            e.target.src = placeholderImage;
                          }}
                        />
                      </div>
                    ))}
                    {itemCount > 3 && (
                      <div className="preview-more">+{itemCount - 3}</div>
                    )}
                  </div>
                )}
                
                <div className="order-info">
                  <div className="info-row">
                    <span className="label">Ngày đặt:</span>
                    <span>{formatDate(orderDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Số lượng:</span>
                    <span>{itemCount} sản phẩm</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Tổng tiền:</span>
                    <span className="order-amount">
                      {formatPrice(orderAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-actions">
                <Link to={`/orders/${orderId}`} className="btn-view-detail">
                  Xem chi tiết
                </Link>
                {order.status === 'pending' && (
                  <button
                    className="btn-cancel-order"
                    onClick={() => handleCancelOrder(orderId)}
                  >
                    Hủy đơn
                  </button>
                )}
                {order.status === 'shipped' && (
                  <button
                    className="btn-confirm-delivery"
                    onClick={() => handleConfirmDelivery(orderId)}
                  >
                    Đã nhận hàng
                  </button>
                )}
                {order.status === 'delivered' && (
                  <button 
                    className="btn-reorder"
                    onClick={() => handleReorder(orderId)}
                  >
                    Mua lại
                  </button>
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

export default BuyerOrders;
