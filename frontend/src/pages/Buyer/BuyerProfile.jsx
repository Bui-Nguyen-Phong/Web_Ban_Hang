import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import './Buyer.css';

const BuyerProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updatedData = await userService.updateProfile(formData);
      updateUser(updatedData);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Cập nhật thất bại' });
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="profile-container">
      <h1>Thông Tin Cá Nhân</h1>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

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

        <form onSubmit={handleSubmit}>
          <div className="profile-section">
            <h3>Thông tin cơ bản</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Họ và tên</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="form-value">{user?.fullName}</p>
                )}
              </div>
              <div className="form-group">
                <label>Email</label>
                <p className="form-value">{user?.email}</p>
                <small className="form-note">Email không thể thay đổi</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số điện thoại</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="form-value">{user?.phone}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                />
              ) : (
                <p className="form-value">{user?.address}</p>
              )}
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Hủy
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa thông tin
                </button>
                <Link to="/change-password" className="btn-secondary">
                  Đổi mật khẩu
                </Link>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerProfile;
