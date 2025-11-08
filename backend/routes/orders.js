const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  getOrderById,
  confirmOrder,
  startProcessing,
  startShipping,
  confirmDelivery,
  cancelOrderByBuyer,
  cancelOrderBySeller,
  getOrderStats,
  getRevenueStats,
} = require('../controllers/orderController');

// Buyer routes
router.post('/', protect, authorize('buyer'), createOrder);
router.get('/buyer/my-orders', protect, authorize('buyer'), getBuyerOrders);
router.get('/buyer/stats', protect, authorize('buyer'), getOrderStats);
router.put('/:id/confirm-delivery', protect, authorize('buyer'), confirmDelivery);
router.put('/:id/cancel-buyer', protect, authorize('buyer'), cancelOrderByBuyer);

// Seller routes
router.get('/seller/my-orders', protect, authorize('seller'), getSellerOrders);
router.get('/seller/stats', protect, authorize('seller'), getOrderStats);
router.get('/seller/revenue-stats', protect, authorize('seller'), getRevenueStats);
router.put('/:id/confirm', protect, authorize('seller'), confirmOrder);
router.put('/:id/start-processing', protect, authorize('seller'), startProcessing);
router.put('/:id/start-shipping', protect, authorize('seller'), startShipping);
router.put('/:id/cancel-seller', protect, authorize('seller'), cancelOrderBySeller);

// Common routes (both buyer and seller)
router.get('/:id', protect, getOrderById);

module.exports = router;
