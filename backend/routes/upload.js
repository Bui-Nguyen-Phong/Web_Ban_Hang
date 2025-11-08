const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  upload,
  uploadProductImage,
  uploadProductImages,
  deleteImage,
} = require('../controllers/uploadController');

// TODO: Chỉ seller mới được upload ảnh sản phẩm
// Upload single image
router.post(
  '/product-image',
  protect,
  authorize('seller'),
  upload.single('image'),
  uploadProductImage
);

// Upload multiple images
router.post(
  '/product-images',
  protect,
  authorize('seller'),
  upload.array('images', 5), // Tối đa 5 ảnh
  uploadProductImages
);

// Delete image
router.delete('/:fileId', protect, authorize('seller'), deleteImage);

module.exports = router;
