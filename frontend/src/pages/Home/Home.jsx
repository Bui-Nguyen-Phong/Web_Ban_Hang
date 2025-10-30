import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Chào mừng đến với Web Bán Hàng</h1>
        <p>Nền tảng mua bán trực tuyến dành cho mọi người</p>
        <div className="hero-buttons">
          <Link to="/register" className="hero-btn primary">
            Đăng ký ngay
          </Link>
          <Link to="/login" className="hero-btn secondary">
            Đăng nhập
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Tính năng nổi bật</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛍️</div>
            <h3>Mua hàng dễ dàng</h3>
            <p>Tìm kiếm và mua sắm các sản phẩm yêu thích một cách nhanh chóng</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Bán hàng hiệu quả</h3>
            <p>Quản lý cửa hàng và sản phẩm của bạn một cách chuyên nghiệp</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Bảo mật cao</h3>
            <p>Thông tin cá nhân và giao dịch được bảo vệ tuyệt đối</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Giao diện thân thiện</h3>
            <p>Thiết kế đơn giản, dễ sử dụng trên mọi thiết bị</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Bạn muốn trở thành?</h2>
        <div className="role-cards">
          <div className="role-card buyer">
            <div className="role-icon">🛒</div>
            <h3>Người Mua</h3>
            <p>Khám phá hàng nghìn sản phẩm chất lượng</p>
            <Link to="/register" className="role-btn">
              Đăng ký mua hàng
            </Link>
          </div>
          <div className="role-card seller">
            <div className="role-icon">🏪</div>
            <h3>Người Bán</h3>
            <p>Mở cửa hàng và kinh doanh online</p>
            <Link to="/register" className="role-btn">
              Đăng ký bán hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
