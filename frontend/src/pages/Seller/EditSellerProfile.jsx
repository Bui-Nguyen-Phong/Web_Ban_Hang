import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import '../Buyer/EditProfile.css';
import './EditSellerProfile.css';

const EditSellerProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || user.fullName || '',
        phone_number: user.phone_number || user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.full_name.trim()) {
      setError('Vui lòng nhập tên cửa hàng');
      setLoading(false);
      return;
    }

    if (!formData.phone_number.trim()) {
      setError('Vui lòng nhập số điện thoại');
      setLoading(false);
      return;
    }

    // Validate phone number format
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(formData.phone_number)) {
      setError('Số điện thoại không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      const updatedData = await userService.updateProfile(formData);
      updateUser(updatedData);
      alert('Cập nhật thông tin thành công!');
      navigate('/seller/profile');
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại. Vui lòng thử lại.');
      console.error('Update profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/seller/profile');
  };

  return (
    <div className="edit-profile-container seller">
      <div className="edit-profile-header">
        <button onClick={handleCancel} className="btn-back">
          ← Quay lại
        </button>
        <h1>Chỉnh sửa thông tin cửa hàng</h1>
      </div>

      <div className="edit-profile-card seller">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-profile-form seller">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            
            <div className="form-group">
              <label htmlFor="full_name">
                Tên cửa hàng <span className="required">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Nhập tên cửa hàng"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={user?.email}
                disabled
                className="input-disabled"
              />
              <small className="form-note">Email không thể thay đổi</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">
                Số điện thoại <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
                disabled={loading}
              />
              <small className="form-note">Ví dụ: 0912345678 hoặc 84912345678</small>
            </div>

            <div className="form-group">
              <label htmlFor="address">
                Địa chỉ cửa hàng <span className="required">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ cửa hàng"
                rows="4"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-save seller"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSellerProfile;
