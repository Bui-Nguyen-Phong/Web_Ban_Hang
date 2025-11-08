import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import './Seller.css';

const SellerProfile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [location]); // Reload when location changes (khi quay lại từ trang edit)

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await userService.getProfile();
      setProfileData(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to user from context if API fails
      setProfileData(user);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Đang tải thông tin...</div>
      </div>
    );
  }

  const displayUser = profileData || user;

  return (
    <div className="profile-container">
      <h1>Thông Tin Cửa Hàng</h1>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar seller">
            {displayUser?.full_name?.charAt(0).toUpperCase() || displayUser?.fullName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className="profile-info">
            <h2>{displayUser?.full_name || displayUser?.fullName}</h2>
            <p className="role-badge seller">Người Bán</p>
          </div>
        </div>

        <div className="profile-section">
          <h3>Thông tin cơ bản</h3>
          
          <div className="info-row">
            <div className="info-group">
              <label>Tên cửa hàng</label>
              <p className="info-value">{displayUser?.full_name || displayUser?.fullName || 'Chưa cập nhật'}</p>
            </div>
          </div>

          <div className="info-row">
            <div className="info-group">
              <label>Email</label>
              <p className="info-value">{displayUser?.email || 'Chưa cập nhật'}</p>
            </div>
          </div>

          <div className="info-row">
            <div className="info-group">
              <label>Số điện thoại</label>
              <p className="info-value">{displayUser?.phone_number || displayUser?.phone || 'Chưa cập nhật'}</p>
            </div>
          </div>

          <div className="info-row">
            <div className="info-group full-width">
              <label>Địa chỉ cửa hàng</label>
              <p className="info-value">{displayUser?.address || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/seller/edit-profile" className="btn-primary seller">
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

export default SellerProfile;
