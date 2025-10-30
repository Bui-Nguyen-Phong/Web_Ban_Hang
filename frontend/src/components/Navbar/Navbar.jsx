import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🛒 Web Bán Hàng
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <span className="navbar-user">
                👤 {user?.fullName}
                <span className={`user-role ${user?.role}`}>
                  {user?.role === 'buyer' ? 'Người mua' : 'Người bán'}
                </span>
              </span>
              
              {user?.role === 'buyer' && (
                <>
                  <Link to="/buyer/dashboard" className="navbar-link">
                    Dashboard
                  </Link>
                  <Link to="/buyer/profile" className="navbar-link">
                    Tài khoản
                  </Link>
                </>
              )}
              
              {user?.role === 'seller' && (
                <>
                  <Link to="/seller/dashboard" className="navbar-link">
                    Dashboard
                  </Link>
                  <Link to="/seller/profile" className="navbar-link">
                    Cửa hàng
                  </Link>
                </>
              )}
              
              <button onClick={handleLogout} className="navbar-btn logout">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-btn">
                Đăng nhập
              </Link>
              <Link to="/register" className="navbar-btn primary">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
