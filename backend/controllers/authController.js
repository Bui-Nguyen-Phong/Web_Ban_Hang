const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { generateToken } = require('../utils/jwt');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, address, role } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc.',
      });
    }

    // Check if user exists
    const [existingUsers] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Map role: buyer -> customer for database
    const dbRole = role === 'buyer' ? 'customer' : (role || 'customer');

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, phone_number, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, phone || null, address || null, dbRole]
    );

    // Generate token with frontend role (buyer/seller)
    const frontendRole = dbRole === 'customer' ? 'buyer' : dbRole;
    const token = generateToken(result.insertId, frontendRole);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      token,
      user: {
        id: result.insertId,
        fullName,
        email,
        phone,
        address,
        role: frontendRole,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng ký tài khoản.',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền email và mật khẩu.',
      });
    }

    // Find user
    const [users] = await pool.query('SELECT user_id, full_name, email, password_hash, phone_number, address, role FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng.',
      });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng.',
      });
    }

    // Map role: customer -> buyer for frontend
    const frontendRole = user.role === 'customer' ? 'buyer' : user.role;

    // Generate token
    const token = generateToken(user.user_id, frontendRole);

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.user_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone_number,
        address: user.address,
        role: frontendRole,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng nhập.',
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const [users] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy email này.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    await pool.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?',
      [resetToken, resetTokenExpire, email]
    );

    // In production, send email here
    // For now, just return the token
    res.json({
      success: true,
      message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn.',
      resetToken, // Remove this in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý yêu cầu.',
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid token
    const [users] = await pool.query(
      'SELECT user_id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn.',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE user_id = ?',
      [hashedPassword, users[0].user_id]
    );

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công!',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đặt lại mật khẩu.',
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
