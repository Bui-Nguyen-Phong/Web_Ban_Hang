import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import './Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setMessage({
        type: 'error',
        text: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
      });
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự' });
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, formData.password);
      setMessage({
        type: 'success',
        text: 'Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...',
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Đặt lại mật khẩu thất bại. Link có thể đã hết hạn.',
      });
    }

    setLoading(false);
  };

  if (!validToken) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>Link Không Hợp Lệ</h2>
          <div className="error-message">
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </div>
          <Link to="/forgot-password" className="btn-primary">
            Yêu cầu link mới
          </Link>
          <p className="auth-link">
            <Link to="/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đặt Lại Mật Khẩu</h2>
        <p className="auth-description">Nhập mật khẩu mới của bạn</p>

        {message.text && (
          <div className={`${message.type}-message`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu mới</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              disabled={!validToken}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Nhập lại mật khẩu mới"
              disabled={!validToken}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !validToken}
          >
            {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
          </button>
        </form>

        <p className="auth-link">
          <Link to="/login">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
