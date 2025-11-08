const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, phone_number, address, role, created_at FROM users WHERE user_id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại.',
      });
    }

    const user = users[0];
    const frontendRole = user.role === 'customer' ? 'buyer' : user.role;

    res.json({
      success: true,
      user: {
        id: user.user_id,
        user_id: user.user_id,
        fullName: user.full_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone_number,
        phone_number: user.phone_number,
        address: user.address,
        role: frontendRole,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng.',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    // Hỗ trợ cả 2 format: camelCase và snake_case
    const { fullName, full_name, phone, phone_number, address } = req.body;
    
    const finalFullName = fullName || full_name;
    const finalPhone = phone || phone_number;
    
    console.log('Update profile request:', { 
      finalFullName, 
      finalPhone, 
      address, 
      userId: req.user.id 
    });

    const updates = [];
    const values = [];

    if (finalFullName) {
      updates.push('full_name = ?');
      values.push(finalFullName);
    }
    if (finalPhone) {
      updates.push('phone_number = ?');
      values.push(finalPhone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có thông tin để cập nhật.',
      });
    }

    values.push(req.user.id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;
    console.log('Executing query:', query);
    console.log('With values:', values);

    await pool.query(query, values);

    // Get updated user
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, phone_number, address, role, created_at FROM users WHERE user_id = ?',
      [req.user.id]
    );

    const user = users[0];
    const frontendRole = user.role === 'customer' ? 'buyer' : user.role;

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công!',
      user: {
        id: user.user_id,
        user_id: user.user_id,
        fullName: user.full_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone_number,
        phone_number: user.phone_number,
        address: user.address,
        role: frontendRole,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin.',
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin.',
      });
    }

    // Get current password
    const [users] = await pool.query('SELECT password_hash FROM users WHERE user_id = ?', [
      req.user.id,
    ]);

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, users[0].password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu cũ không đúng.',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [
      hashedPassword,
      req.user.id,
    ]);

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công!',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đổi mật khẩu.',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
