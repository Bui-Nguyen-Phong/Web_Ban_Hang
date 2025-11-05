import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Buyer.css';

const BuyerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h1>Dashboard Người Mua</h1>
      <div className="welcome-section">
        <h2>Xin chào, {user?.fullName}!</h2>
        <p>Chào mừng bạn đến với trang quản lý của người mua</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">🛍️</div>
          <h3>Đơn Hàng</h3>
          <p>Xem và quản lý đơn hàng của bạn</p>
          <Link to="/buyer/orders" className="card-link">Xem chi tiết →</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">❤️</div>
          <h3>Yêu Thích</h3>
          <p>Danh sách sản phẩm yêu thích</p>
          <Link to="/buyer/favorites" className="card-link">Xem chi tiết →</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🛒</div>
          <h3>Giỏ Hàng</h3>
          <p>Xem giỏ hàng của bạn</p>
          <Link to="/cart" className="card-link">Xem chi tiết →</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">👤</div>
          <h3>Thông Tin Cá Nhân</h3>
          <p>Quản lý thông tin tài khoản</p>
          <Link to="/buyer/profile" className="card-link">Xem chi tiết →</Link>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Hành động nhanh</h3>
        <div className="action-buttons">
          <Link to="/products" className="action-btn">
            🔍 Tìm kiếm sản phẩm
          </Link>
          <Link to="/buyer/profile" className="action-btn">
            ⚙️ Cài đặt tài khoản
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
