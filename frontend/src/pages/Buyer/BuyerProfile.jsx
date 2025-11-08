import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Buyer.css';

const BuyerProfile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-container">
      <h1>Thông Tin Cá Nhân</h1>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{user?.fullName}</h2>
            <p className="role-badge buyer">Người Mua</p>
          </div>
        </div>

        <div className="profile-section">
          <h3>Thông tin cơ bản</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Họ và tên</label>
              <p className="form-value">{user?.fullName}</p>
            </div>
            <div className="form-group">
              <label>Email</label>
              <p className="form-value">{user?.email}</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số điện thoại</label>
              <p className="form-value">{user?.phone || 'Chưa cập nhật'}</p>
            </div>
            <div className="form-group">
              <label>Vai trò</label>
              <p className="form-value">{user?.role === 'buyer' ? 'Người Mua' : 'Người Bán'}</p>
            </div>
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <p className="form-value">{user?.address || 'Chưa cập nhật'}</p>
          </div>
        </div>

        <div className="profile-section">
          <h3>Thống kê</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Ngày tham gia</span>
              <span className="stat-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/buyer/edit-profile" className="btn-primary">
            Chỉnh sửa thông tin
          </Link>
          <Link to="/change-password" className="btn-secondary">
            Đổi mật khẩu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;
