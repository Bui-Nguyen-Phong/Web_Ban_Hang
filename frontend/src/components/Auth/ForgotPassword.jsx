import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authService.forgotPassword(email);
      setMessage({
        type: 'success',
        text: 'Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.',
      });
      setEmail('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Có lỗi xảy ra. Vui lòng thử lại.',
      });
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Quên Mật Khẩu</h2>
        <p className="auth-description">
          Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
        </p>

        {message.text && (
          <div className={`${message.type}-message`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi Email Đặt Lại'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="auth-link-item">
            ← Quay lại đăng nhập
          </Link>
          <Link to="/register" className="auth-link-item">
            Chưa có tài khoản?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
