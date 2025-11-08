const { pool } = require('../config/database');
const { createPaymentUrl, verifyReturnUrl, getResponseMessage } = require('../config/vnpay');

// @desc    Tạo payment URL cho đơn hàng
// @route   POST /api/payment/vnpay/create
// @access  Private
const createVNPayPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đơn hàng',
      });
    }

    // Lấy thông tin đơn hàng
    const [orders] = await pool.query(
      `SELECT o.*, u.full_name, u.email 
       FROM orders o 
       JOIN users u ON o.user_id = u.user_id 
       WHERE o.order_id = ? AND o.user_id = ?`,
      [orderId, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    const order = orders[0];

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng không ở trạng thái chờ thanh toán',
      });
    }

    // Lấy IP của client
    const ipAddr = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   req.connection.socket.remoteAddress ||
                   '127.0.0.1';

    // Tạo order info
    const orderInfo = `Thanh toan don hang ${orderId}`;

    // TODO: Tạo payment URL
    const paymentUrl = createPaymentUrl(
      orderId,
      order.total_amount,
      orderInfo,
      ipAddr
    );

    // Lưu transaction vào database (optional)
    await pool.query(
      `INSERT INTO payment_transactions (order_id, amount, payment_method, status, created_at) 
       VALUES (?, ?, 'VNPAY', 'pending', NOW())`,
      [orderId, order.total_amount]
    );

    res.json({
      success: true,
      paymentUrl: paymentUrl,
      message: 'Tạo link thanh toán thành công',
    });
  } catch (error) {
    console.error('Create VNPAY payment error:', error);
    
    // TODO: Xử lý lỗi khi chưa config VNPAY
    if (error.message.includes('VNPAY')) {
      return res.status(500).json({
        success: false,
        message: error.message + '. Vui lòng xem hướng dẫn trong backend/config/vnpay.js',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo link thanh toán',
    });
  }
};

// @desc    Xử lý callback từ VNPAY (IPN - Instant Payment Notification)
// @route   GET /api/payment/vnpay/ipn
// @access  Public (VNPAY callback)
const vnpayIPN = async (req, res) => {
  try {
    const vnp_Params = req.query;

    // Verify signature
    const verifyResult = verifyReturnUrl(vnp_Params);

    if (!verifyResult.verified) {
      return res.status(200).json({
        RspCode: '97',
        Message: 'Checksum failed',
      });
    }

    const { orderId, amount, responseCode, transactionNo, bankCode, payDate } = verifyResult;

    // Kiểm tra đơn hàng tồn tại
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE order_id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(200).json({
        RspCode: '01',
        Message: 'Order not found',
      });
    }

    const order = orders[0];

    // Kiểm tra số tiền
    if (amount !== order.total_amount) {
      return res.status(200).json({
        RspCode: '04',
        Message: 'Invalid amount',
      });
    }

    // Kiểm tra đã thanh toán chưa
    if (order.status === 'paid') {
      return res.status(200).json({
        RspCode: '02',
        Message: 'Order already confirmed',
      });
    }

    // Cập nhật trạng thái đơn hàng
    if (responseCode === '00') {
      // Thanh toán thành công
      await pool.query(
        'UPDATE orders SET status = ?, payment_method = ?, payment_date = NOW() WHERE order_id = ?',
        ['paid', 'VNPAY', orderId]
      );

      // Cập nhật transaction
      await pool.query(
        `UPDATE payment_transactions 
         SET status = 'success', transaction_no = ?, bank_code = ?, pay_date = ?, updated_at = NOW() 
         WHERE order_id = ? AND status = 'pending'`,
        [transactionNo, bankCode, payDate, orderId]
      );

      return res.status(200).json({
        RspCode: '00',
        Message: 'Success',
      });
    } else {
      // Thanh toán thất bại
      await pool.query(
        'UPDATE orders SET status = ? WHERE order_id = ?',
        ['cancelled', orderId]
      );

      await pool.query(
        `UPDATE payment_transactions 
         SET status = 'failed', transaction_no = ?, response_code = ?, updated_at = NOW() 
         WHERE order_id = ? AND status = 'pending'`,
        [transactionNo || null, responseCode, orderId]
      );

      return res.status(200).json({
        RspCode: '00',
        Message: 'Success',
      });
    }
  } catch (error) {
    console.error('VNPAY IPN error:', error);
    return res.status(200).json({
      RspCode: '99',
      Message: 'Unknown error',
    });
  }
};

// @desc    Xử lý return từ VNPAY (User redirect về)
// @route   GET /api/payment/vnpay/return
// @access  Public
const vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;

    // Verify signature
    const verifyResult = verifyReturnUrl(vnp_Params);

    if (!verifyResult.verified) {
      return res.json({
        success: false,
        message: 'Xác thực thanh toán thất bại',
      });
    }

    const { orderId, amount, responseCode, transactionNo, bankCode } = verifyResult;

    // Lấy message từ response code
    const message = getResponseMessage(responseCode);

    if (responseCode === '00') {
      // Thanh toán thành công
      return res.json({
        success: true,
        orderId: orderId,
        amount: amount,
        transactionNo: transactionNo,
        bankCode: bankCode,
        message: 'Thanh toán thành công',
      });
    } else {
      // Thanh toán thất bại
      return res.json({
        success: false,
        orderId: orderId,
        responseCode: responseCode,
        message: message,
      });
    }
  } catch (error) {
    console.error('VNPAY return error:', error);
    return res.json({
      success: false,
      message: 'Lỗi xử lý kết quả thanh toán',
    });
  }
};

// @desc    Lấy thông tin giao dịch
// @route   GET /api/payment/transaction/:orderId
// @access  Private
const getTransaction = async (req, res) => {
  try {
    const { orderId } = req.params;

    const [transactions] = await pool.query(
      `SELECT pt.*, o.total_amount, o.status as order_status 
       FROM payment_transactions pt
       JOIN orders o ON pt.order_id = o.order_id
       WHERE pt.order_id = ? AND o.user_id = ?`,
      [orderId, req.user.id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch',
      });
    }

    res.json({
      success: true,
      transaction: transactions[0],
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin giao dịch',
    });
  }
};

module.exports = {
  createVNPayPayment,
  vnpayIPN,
  vnpayReturn,
  getTransaction,
};
