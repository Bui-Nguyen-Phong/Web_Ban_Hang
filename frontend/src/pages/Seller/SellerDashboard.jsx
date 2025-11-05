import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Seller.css';

const SellerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h1>Dashboard Người Bán</h1>
      <div className="welcome-section seller">
        <h2>Xin chào, {user?.fullName}!</h2>
        <p>Chào mừng bạn đến với trang quản lý cửa hàng</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">📦</div>
          <h3>Sản Phẩm</h3>
          <p>Quản lý danh sách sản phẩm</p>
          <Link to="/seller/products" className="card-link">Xem chi tiết →</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📋</div>
          <h3>Đơn Hàng</h3>
          <p>Xem và xử lý đơn hàng</p>
          <Link to="/seller/orders" className="card-link">Xem chi tiết →</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">💰</div>
          <h3>Doanh Thu</h3>
          <p>Thống kê doanh thu bán hàng</p>
          <Link to="/seller/revenue" className="card-link">Xem chi tiết →</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">👤</div>
          <h3>Thông Tin Cửa Hàng</h3>
          <p>Quản lý thông tin cửa hàng</p>
          <Link to="/seller/profile" className="card-link">Xem chi tiết →</Link>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Hành động nhanh</h3>
        <div className="action-buttons">
          <Link to="/seller/products/add" className="action-btn seller">
            ➕ Thêm sản phẩm mới
          </Link>
          <Link to="/seller/products" className="action-btn seller">
            📦 Quản lý sản phẩm
          </Link>
          <Link to="/seller/orders" className="action-btn seller">
            📋 Xem đơn hàng mới
          </Link>
          <Link to="/seller/profile" className="action-btn seller">
            ⚙️ Cài đặt cửa hàng
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
