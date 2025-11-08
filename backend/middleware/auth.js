const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/database');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập. Vui lòng đăng nhập.',
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn.',
      });
    }

    // Get user from database
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, phone_number, address, role FROM users WHERE user_id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại.',
      });
    }

    const user = users[0];
    // Map role: customer -> buyer for frontend
    const frontendRole = user.role === 'customer' ? 'buyer' : user.role;

    // Attach user to request
    req.user = {
      id: user.user_id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone_number,
      address: user.address,
      role: frontendRole,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập.',
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // roles từ frontend: buyer, seller
    // req.user.role đã được map sang buyer/seller từ protect middleware
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' không có quyền truy cập tài nguyên này.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
