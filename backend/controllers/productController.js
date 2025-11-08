const { pool } = require('../config/database');

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT category_id, name FROM category ORDER BY name');
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách danh mục',
    });
  }
};

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      order = 'DESC',
    } = req.query;

    const offset = (page - 1) * limit;
    let query = 'SELECT p.*, u.full_name as seller_name FROM products p LEFT JOIN users u ON p.seller_id = u.user_id WHERE 1=1';
    const params = [];

    // Search filter
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Category filter
    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    // Price range filter
    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    // Count total
    const countQuery = query.replace(
      'SELECT p.*, u.full_name as seller_name FROM products p',
      'SELECT COUNT(*) as total FROM products p'
    );
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Add sorting and pagination
    const validSortFields = ['created_at', 'product_id', 'price', 'name', 'stock_quantity'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY p.${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [products] = await pool.query(query, params);

    // Format products to camelCase
    const formattedProducts = products.map((product) => ({
      id: product.product_id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock_quantity,
      category: product.category_id,
      imageUrl: product.image_url,
      sellerName: product.seller_name,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm.',
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT p.*, u.full_name as seller_name, u.phone_number as seller_phone FROM products p LEFT JOIN users u ON p.seller_id = u.user_id WHERE p.product_id = ?',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm.',
      });
    }

    const product = products[0];

    // Format product to camelCase
    const formattedProduct = {
      id: product.product_id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock_quantity,
      category: product.category_id,
      imageUrl: product.image_url,
      seller: {
        name: product.seller_name,
        phone: product.seller_phone,
      },
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };

    res.json({
      success: true,
      product: formattedProduct,
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sản phẩm.',
    });
  }
};

// @desc    Get seller's products
// @route   GET /api/products/seller/my-products
// @access  Private (Seller only)
const getSellerProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products WHERE seller_id = ?';
    const params = [req.user.id];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count total
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get products
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [products] = await pool.query(query, params);

    const formattedProducts = products.map(product => ({
      id: product.product_id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock_quantity,
      category: product.category_id,
      imageUrl: product.image_url,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm.',
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Seller only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl, images, specifications } =
      req.body;

    if (!name || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc.',
      });
    }

    // Chuyển đổi category name thành category_id nếu là string
    let categoryId = category;
    if (typeof category === 'string' && isNaN(category)) {
      // Tìm category_id từ tên category
      const [categoryResult] = await pool.query(
        'SELECT category_id FROM category WHERE name = ?',
        [category]
      );
      
      if (categoryResult.length === 0) {
        // Nếu không tìm thấy, tạo category mới
        const [newCategory] = await pool.query(
          'INSERT INTO category (name) VALUES (?)',
          [category]
        );
        categoryId = newCategory.insertId;
      } else {
        categoryId = categoryResult[0].category_id;
      }
    }

    const [result] = await pool.query(
      'INSERT INTO products (seller_id, name, description, price, category_id, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        name,
        description || null,
        price,
        categoryId,
        stock,
        imageUrl || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công!',
      productId: result.insertId,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo sản phẩm.',
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller only - own product)
const updateProduct = async (req, res) => {
  try {
    // Check if product belongs to seller
    const [products] = await pool.query(
      'SELECT seller_id FROM products WHERE user_id = ?',
      [req.params.user_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm.',
      });
    }

    if (products[0].seller_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa sản phẩm này.',
      });
    }

    const { name, description, price, category, stock, imageUrl, images, specifications } =
      req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (price) {
      updates.push('price = ?');
      values.push(price);
    }
    if (category) {
      // Chuyển đổi category name thành category_id nếu là string
      let categoryId = category;
      if (typeof category === 'string' && isNaN(category)) {
        const [categoryResult] = await pool.query(
          'SELECT category_id FROM category WHERE name = ?',
          [category]
        );
        
        if (categoryResult.length === 0) {
          const [newCategory] = await pool.query(
            'INSERT INTO category (name) VALUES (?)',
            [category]
          );
          categoryId = newCategory.insertId;
        } else {
          categoryId = categoryResult[0].category_id;
        }
      }
      updates.push('category_id = ?');
      values.push(categoryId);
    }
    if (stock !== undefined) {
      updates.push('stock_quantity = ?');
      values.push(stock);
    }
    if (imageUrl !== undefined) {
      updates.push('image_url = ?');
      values.push(imageUrl);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có thông tin để cập nhật.',
      });
    }

    values.push(req.params.id);

    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE product_id = ?`, values);

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công!',
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật sản phẩm.',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller only - own product)
const deleteProduct = async (req, res) => {
  try {
    // Check if product belongs to seller
    const [products] = await pool.query(
      'SELECT seller_id FROM products WHERE product_id = ?',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm.',
      });
    }

    if (products[0].seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa sản phẩm này.',
      });
    }

    await pool.query('DELETE FROM products WHERE product_id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công!',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm.',
    });
  }
};

module.exports = {
  getCategories,
  getProducts,
  getProductById,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
