const { pool } = require('../config/database');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private (Buyer only)
const getCart = async (req, res) => {
  try {
    const [cartItems] = await pool.query(
      `SELECT c.cart_item_id, c.quantity, 
        p.product_id as product_id, p.name as product_name, p.price as product_price, 
        p.stock_quantity as product_stock, p.image_url as product_imageUrl, p.category_id as product_category,
        u.full_name as seller_name
      FROM cart_items c
      JOIN products p ON c.product_id = p.product_id
      JOIN users u ON p.seller_id = u.user_id
      WHERE c.user_id = ?`,
      [req.user.id]
    );

    // Format cart items
    const items = cartItems.map((item) => ({
      id: item.cart_item_id,
      quantity: item.quantity,
      product: {
        id: item.product_id,
        name: item.product_name,
        price: item.product_price,
        stock: item.product_stock,
        imageUrl: item.product_imageUrl,
        category: item.product_category,
        sellerName: item.seller_name,
      },
    }));

    res.json({
      success: true,
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy giỏ hàng.',
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private (Buyer only)
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and has enough stock
    const [products] = await pool.query(
      'SELECT product_id, stock_quantity FROM products WHERE product_id = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm.',
      });
    }

    if (products[0].stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Không đủ số lượng trong kho.',
      });
    }

    // Check if item already in cart
    const [existingItems] = await pool.query(
      'SELECT cart_item_id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;

      if (products[0].stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Không đủ số lượng trong kho.',
        });
      }

      await pool.query('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [
        newQuantity,
        existingItems[0].cart_item_id,
      ]);
    } else {
      // Insert new item
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, productId, quantity]
      );
    }

    res.json({
      success: true,
      message: 'Đã thêm sản phẩm vào giỏ hàng.',
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm vào giỏ hàng.',
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:id
// @access  Private (Buyer only)
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng phải lớn hơn 0.',
      });
    }

    // Check if cart item belongs to user
    const [cartItems] = await pool.query(
      'SELECT c.product_id, p.stock_quantity FROM cart_items c JOIN products p ON c.product_id = p.product_id WHERE c.cart_item_id = ? AND c.user_id = ?',
      [req.params.id, req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng.',
      });
    }

    if (cartItems[0].stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Không đủ số lượng trong kho.',
      });
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [
      quantity,
      req.params.id,
    ]);

    res.json({
      success: true,
      message: 'Cập nhật giỏ hàng thành công.',
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật giỏ hàng.',
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:id
// @access  Private (Buyer only)
const removeFromCart = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE cart_item_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng.',
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng.',
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm.',
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private (Buyer only)
const clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng.',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa giỏ hàng.',
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
