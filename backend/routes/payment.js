const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createVNPayPayment,
  vnpayIPN,
  vnpayReturn,
  getTransaction,
} = require('../controllers/paymentController');

// TODO: Tạo payment URL (cần đăng nhập)
router.post('/vnpay/create', protect, createVNPayPayment);

// TODO: VNPAY IPN callback (không cần auth - VNPAY server gọi)
router.get('/vnpay/ipn', vnpayIPN);

// TODO: VNPAY return URL (không cần auth - user redirect về)
router.get('/vnpay/return', vnpayReturn);

// Get transaction info
router.get('/transaction/:orderId', protect, getTransaction);

module.exports = router;
