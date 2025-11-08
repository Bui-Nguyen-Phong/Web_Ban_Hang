import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import './Buyer.css';
import './EditProfile.css';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Submitting data:', formData);
      const updatedData = await userService.updateProfile(formData);
      console.log('Received updated data:', updatedData);
      
      updateUser(updatedData);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      
      // Chuyển về trang profile sau 1.5 giây
      setTimeout(() => {
        navigate('/buyer/profile');
      }, 1500);
    } catch (error) {
      console.error('Update profile error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Cập nhật thất bại. Vui lòng thử lại!' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/buyer/profile');
  };

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>Chỉnh Sửa Thông Tin Cá Nhân</h1>
        <Link to="/buyer/profile" className="back-link">
          ← Quay lại
        </Link>
      </div>

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

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="profile-section">
            <h3>Thông tin cơ bản</h3>
            
            <div className="form-row">
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
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="input-disabled"
                />
                <small className="form-note">Email không thể thay đổi</small>
              </div>
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
                  pattern="[0-9]{10,11}"
                  title="Số điện thoại phải có 10-11 chữ số"
                />
                <small className="form-note">Ví dụ: 0987654321</small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">
                Địa chỉ <span className="required">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ đầy đủ"
                required
                rows="4"
                minLength={10}
                maxLength={500}
              />
              <small className="form-note">
                Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>

      <div className="help-section">
        <h4>💡 Lưu ý khi cập nhật thông tin:</h4>
        <ul>
          <li>Họ tên phải có ít nhất 2 ký tự</li>
          <li>Số điện thoại phải có 10-11 chữ số</li>
          <li>Địa chỉ nên điền đầy đủ để thuận tiện cho việc giao hàng</li>
          <li>Email không thể thay đổi sau khi đăng ký</li>
        </ul>
      </div>
    </div>
  );
};

export default EditProfile;
