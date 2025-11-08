const multer = require('multer');
const { uploadFileToDrive, deleteFileFromDrive } = require('../config/googleDrive');

// Cấu hình multer để lưu file tạm trong memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận file ảnh
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
});

// @desc    Upload ảnh sản phẩm lên Google Drive
// @route   POST /api/upload/product-image
// @access  Private (Seller only)
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh',
      });
    }

    // TODO: Kiểm tra xem Pinata JWT đã được cấu hình chưa
    // Nếu chưa, trả về thông báo yêu cầu setup
    
    // Generate unique filename
    const timestamp = Date.now();
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    const fileName = `product_${timestamp}_${originalName}`;

    // Upload lên Pinata IPFS
    const result = await uploadFileToDrive(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    res.json({
      success: true,
      message: 'Upload ảnh thành công',
      imageUrl: result.imageUrl,
      fileId: result.fileId,
      ipfsHash: result.ipfsHash,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    
    // TODO: Nếu Pinata chưa setup, trả về hướng dẫn
    if (error.message.includes('PINATA_JWT')) {
      return res.status(500).json({
        success: false,
        message: 'Pinata chưa được cấu hình. Vui lòng xem hướng dẫn trong file backend/config/googleDrive.js hoặc .env',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi upload ảnh',
    });
  }
};

// @desc    Upload nhiều ảnh sản phẩm
// @route   POST /api/upload/product-images
// @access  Private (Seller only)
const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một file ảnh',
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const timestamp = Date.now();
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const fileName = `product_${timestamp}_${originalName}`;

      return await uploadFileToDrive(file.buffer, fileName, file.mimetype);
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: `Upload ${results.length} ảnh thành công`,
      imageUrls: results.map((r) => r.imageUrl),
      fileIds: results.map((r) => r.fileId),
    });
  } catch (error) {
    console.error('Upload images error:', error);
    
    if (error.message.includes('PINATA_JWT')) {
      return res.status(500).json({
        success: false,
        message: 'Pinata chưa được cấu hình. Vui lòng xem hướng dẫn trong file backend/config/googleDrive.js hoặc .env',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi upload ảnh',
    });
  }
};

// @desc    Xóa ảnh từ Google Drive
// @route   DELETE /api/upload/:fileId
// @access  Private (Seller only)
const deleteImage = async (req, res) => {
  try {
    const { fileId } = req.params;

    await deleteFileFromDrive(fileId);

    res.json({
      success: true,
      message: 'Xóa ảnh thành công',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa ảnh',
    });
  }
};

module.exports = {
  upload,
  uploadProductImage,
  uploadProductImages,
  deleteImage,
};
