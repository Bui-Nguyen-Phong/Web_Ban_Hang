const { pool } = require('../config/database');

// Tạo đơn hàng mới
exports.createOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const buyerId = req.user.id;
    const { shippingAddress, paymentMethod, note } = req.body;
    
    if (!shippingAddress || !paymentMethod) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng và phương thức thanh toán',
      });
    }
    
    // Lấy giỏ hàng của người dùng
    const [cartItems] = await connection.query(
      `SELECT c.cart_item_id, c.product_id, c.quantity, 
              p.name, p.price, p.stock_quantity, p.seller_id
       FROM cart_items c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = ?`,
      [buyerId]
    );
    
    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng',
      });
    }
    
    // Kiểm tra tồn kho cho tất cả sản phẩm
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${item.name}" chỉ còn ${item.stock_quantity} sản phẩm trong kho`,
        });
      }
    }
    
    // Tính tổng tiền
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    const shippingFee = 30000; // Phí ship cố định 30,000đ
    const finalAmount = totalAmount + shippingFee;
    
    // Tạo mã đơn hàng
    const orderNumber = 'ORD' + Date.now();
    
    // Chuyển shipping address thành JSON string
    const shippingAddressJSON = JSON.stringify(shippingAddress);
    
    // Tạo đơn hàng
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, shipping_address, total_amount, status, order_date)
       VALUES (?, ?, ?, 'pending', NOW())`,
      [buyerId, shippingAddressJSON, finalAmount]
    );
    
    const orderId = orderResult.insertId;
    
    // Tạo order items và cập nhật tồn kho
    for (const item of cartItems) {
      const subtotal = item.price * item.quantity;
      
      // Thêm order item
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, seller_id, product_name, 
                                  product_price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.seller_id, item.name, item.price, item.quantity, subtotal]
      );
      
      // Cập nhật tồn kho
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Xóa giỏ hàng
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [buyerId]);
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: {
        orderId,
        orderNumber,
        totalAmount: finalAmount,
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Lấy danh sách đơn hàng của người mua
exports.getBuyerOrders = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT o.*, COUNT(oi.order_item_id) as itemCount
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = ?
    `;
    
    const queryParams = [buyerId];
    
    if (status) {
      query += ' AND o.status = ?';
      queryParams.push(status);
    }
    
    query += ' GROUP BY o.order_id ORDER BY o.order_date DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [orders] = await pool.query(query, queryParams);
    
    // Lấy hình ảnh sản phẩm đầu tiên cho mỗi đơn hàng
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.product_name, p.image_url as product_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.product_id
         WHERE oi.order_id = ?
         LIMIT 3`,
        [order.order_id]
      );
      order.previewItems = items;
    }
    
    // Lấy tổng số đơn hàng
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
    const countParams = [buyerId];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách đơn hàng của người bán
exports.getSellerOrders = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT DISTINCT o.*, u.full_name as buyer_name, u.phone_number as buyer_phone
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN users u ON o.user_id = u.user_id
      WHERE oi.seller_id = ?
    `;
    
    const queryParams = [sellerId];
    
    if (status) {
      query += ' AND o.status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY o.order_date DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [orders] = await pool.query(query, queryParams);
    
    // Lấy số lượng sản phẩm của seller trong mỗi đơn hàng
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT COUNT(*) as count, SUM(quantity) as totalQuantity, SUM(subtotal) as totalAmount
         FROM order_items 
         WHERE order_id = ? AND seller_id = ?`,
        [order.order_id, sellerId]
      );
      
      order.sellerItemCount = items[0].count;
      order.sellerTotalQuantity = items[0].totalQuantity;
      order.sellerTotalAmount = items[0].totalAmount;
    }
    
    // Lấy tổng số đơn hàng
    let countQuery = `
      SELECT COUNT(DISTINCT o.order_id) as total
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE oi.seller_id = ?
    `;
    const countParams = [sellerId];
    
    if (status) {
      countQuery += ' AND o.status = ?';
      countParams.push(status);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Lấy thông tin đơn hàng
    const [orders] = await pool.query(
      `SELECT o.*, u.full_name as buyer_name, u.email as buyer_email, u.phone_number as buyer_phone
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       WHERE o.order_id = ?`,
      [id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }
    
    const order = orders[0];
    
    // Kiểm tra quyền truy cập
    if (userRole === 'buyer' && order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này',
      });
    }
    
    // Lấy danh sách sản phẩm trong đơn hàng
    let itemsQuery = `
      SELECT oi.*, 
             u.full_name as seller_name, 
             u.phone_number as seller_phone,
             p.image_url as product_image
      FROM order_items oi
      JOIN users u ON oi.seller_id = u.user_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?
    `;
    
    const itemsParams = [id];
    
    // Nếu là người bán, chỉ lấy sản phẩm của họ
    if (userRole === 'seller') {
      itemsQuery += ' AND oi.seller_id = ?';
      itemsParams.push(userId);
      
      // Kiểm tra xem seller có sản phẩm trong đơn hàng này không
      const [sellerItems] = await pool.query(
        'SELECT order_item_id FROM order_items WHERE order_id = ? AND seller_id = ?',
        [id, userId]
      );
      
      if (sellerItems.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem đơn hàng này',
        });
      }
    }
    
    const [items] = await pool.query(itemsQuery, itemsParams);
    
    order.items = items;
    
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật trạng thái đơn hàng (chỉ người bán)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.user.id;
    
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ',
      });
    }
    
    // Kiểm tra xem seller có sản phẩm trong đơn hàng này không
    const [items] = await pool.query(
      'SELECT order_item_id FROM order_items WHERE order_id = ? AND seller_id = ?',
      [id, sellerId]
    );
    
    if (items.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật đơn hàng này',
      });
    }
    
    // Lấy trạng thái hiện tại
    const [orders] = await pool.query('SELECT status FROM orders WHERE order_id = ?', [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }
    
    const currentStatus = orders[0].status;
    
    // Kiểm tra logic chuyển trạng thái
    if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật đơn hàng đã hủy hoặc đã giao',
      });
    }
    
    // Cập nhật trạng thái
    await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, id]);
    
    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
    });
  } catch (error) {
    next(error);
  }
};

// Hủy đơn hàng (chỉ người mua, chỉ khi đơn hàng còn pending)
exports.cancelOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const buyerId = req.user.id;
    
    // Lấy thông tin đơn hàng
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE order_id = ? AND user_id = ?',
      [id, buyerId]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }
    
    const order = orders[0];
    
    if (order.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý',
      });
    }
    
    // Lấy danh sách sản phẩm trong đơn hàng
    const [items] = await connection.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [id]
    );
    
    // Hoàn trả tồn kho
    for (const item of items) {
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Cập nhật trạng thái đơn hàng
    await connection.query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      ['cancelled', id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Hủy đơn hàng thành công',
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// SELLER: Xác nhận đơn hàng (pending -> confirmed)
exports.confirmOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const sellerId = req.user.id;
    
    // Kiểm tra seller có sản phẩm trong đơn hàng
    const [items] = await connection.query(
      'SELECT order_item_id FROM order_items WHERE order_id = ? AND seller_id = ?',
      [id, sellerId]
    );
    
    if (items.length === 0) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật đơn hàng này',
      });
    }
    
    // Lấy trạng thái hiện tại
    const [orders] = await connection.query(
      'SELECT status FROM orders WHERE order_id = ?',
      [id]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }
    
    const currentStatus = orders[0].status;
    
    if (currentStatus !== 'pending') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận đơn hàng đang chờ xác nhận',
      });
    }
    
    // Cập nhật trạng thái sang 'paid' (đã xác nhận)
    await connection.query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      ['paid', id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Xác nhận đơn hàng thành công',
      data: { status: 'paid' },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Confirm order error:', error);
    next(error);
  } finally {
    connection.release();
  }
};

// SELLER: Bắt đầu chuẩn bị hàng (confirmed -> processing)
exports.startProcessing = async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const sellerId = req.user.id;
    
    // Kiểm tra seller có sản phẩm trong đơn hàng
    const [items] = await connection.query(
      'SELECT order_item_id FROM order_items WHERE order_id = ? AND seller_id = ?',
      [id, sellerId]
    );
    
    if (items.length === 0) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật đơn hàng này',
      });
    }
    
    // Lấy trạng thái hiện tại
    const [orders] = await connection.query(
      'SELECT status FROM orders WHERE order_id = ?',
      [id]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }
    
    const currentStatus = orders[0].status;
    
    if (currentStatus !== 'confirmed') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể chuẩn bị hàng cho đơn đã xác nhận',
      });
    }
    
    // Cập nhật trạng thái
    await connection.query(
      'UPDATE orders SET status = ?, processing_at = NOW() WHERE order_id = ?',
      ['processing', id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Bắt đầu chuẩn bị hàng thành công',
      data: { status: 'processing' },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Start processing error:', error);
    next(error);
  } finally {
    connection.release();
  }
};

// SELLER: Bắt đầu giao hàng (processing -> shipping)
exports.startShipping = async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const sellerId = req.user.id;
    
    // Kiểm tra seller có sản phẩm trong đơn hàng
    const [items] = await connection.query(
      'SELECT order_item_id FROM order_items WHERE order_id = ? AND seller_id = ?',
      [id, sellerId]
    );
    
    if (items.length === 0) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật đơn hàng này',
      });
    }
    
    // Lấy trạng thái hiện tại
    const [orders] = await connection.query(
      'SELECT status FROM orders WHERE order_id = ?',
      [id]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }
    
    const currentStatus = orders[0].status;
    
    // Cho phép chuyển từ 'paid' (đã xác nhận) sang 'shipped' (đang giao)
    if (currentStatus !== 'paid') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể giao hàng sau khi đã xác nhận đơn hàng',
      });
    }
    
    // Cập nhật trạng thái sang 'shipped'
    await connection.query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      ['shipped', id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Đơn hàng đã bắt đầu giao',
      data: { status: 'shipped' },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Start shipping error:', error);
    next(error);
  } finally {
    connection.release();
  }
};

// BUYER: Xác nhận đã nhận hàng (shipping -> delivered)
exports.confirmDelivery = async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const buyerId = req.user.id;
    
    // Lấy thông tin đơn hàng
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE order_id = ? AND user_id = ?',
      [id, buyerId]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }
    
    const order = orders[0];
    
    // Cho phép xác nhận khi đơn hàng đang ở trạng thái 'shipped'
    if (order.status !== 'shipped') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận nhận hàng khi đơn đang được giao',
      });
    }
    
    // Cập nhật trạng thái sang 'delivered'
    await connection.query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      ['delivered', id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Xác nhận đã nhận hàng thành công',
      data: { status: 'delivered' },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Confirm delivery error:', error);
    next(error);
  } finally {
    connection.release();
  }
};

// BUYER: Hủy đơn hàng (chỉ khi pending)
exports.cancelOrderByBuyer = async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const buyerId = req.user.id;
    const { reason } = req.body;
    
    // Lấy thông tin đơn hàng
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE order_id = ? AND user_id = ?',
      [id, buyerId]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }
    
    const order = orders[0];
    
    if (order.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận',
      });
    }
    
    // Lấy danh sách sản phẩm trong đơn hàng
    const [items] = await connection.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [id]
    );
    
    // Hoàn trả tồn kho
    for (const item of items) {
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Cập nhật trạng thái đơn hàng
    await connection.query(
      `UPDATE orders 
       SET status = ?, cancelled_at = NOW(), cancel_reason = ?, cancelled_by = ?
       WHERE order_id = ?`,
      ['cancelled', reason || 'Người mua hủy đơn', 'buyer', id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: { status: 'cancelled' },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Cancel order by buyer error:', error);
    next(error);
  } finally {
    connection.release();
  }
};

// SELLER: Hủy đơn hàng (chỉ khi pending hoặc confirmed)
exports.cancelOrderBySeller = async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const sellerId = req.user.id;
    const { reason } = req.body;
    
    if (!reason) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập lý do hủy đơn',
      });
    }
    
    // Kiểm tra seller có sản phẩm trong đơn hàng
    const [items] = await connection.query(
      'SELECT order_item_id FROM order_items WHERE order_id = ? AND seller_id = ?',
      [id, sellerId]
    );
    
    if (items.length === 0) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy đơn hàng này',
      });
    }
    
    // Lấy thông tin đơn hàng
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE order_id = ?',
      [id]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }
    
    const order = orders[0];
    
    if (!['pending', 'confirmed'].includes(order.status)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy đơn hàng chưa bắt đầu chuẩn bị',
      });
    }
    
    // Lấy danh sách sản phẩm trong đơn hàng
    const [orderItems] = await connection.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [id]
    );
    
    // Hoàn trả tồn kho
    for (const item of orderItems) {
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Cập nhật trạng thái đơn hàng
    await connection.query(
      `UPDATE orders 
       SET status = ?, cancelled_at = NOW(), cancel_reason = ?, cancelled_by = ?
       WHERE order_id = ?`,
      ['cancelled', reason, 'seller', id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: { status: 'cancelled' },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Cancel order by seller error:', error);
    next(error);
  } finally {
    connection.release();
  }
};

// Lấy thống kê đơn hàng theo trạng thái
exports.getOrderStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role === 'customer' ? 'buyer' : req.user.role;
    
    let query;
    let params;
    
    if (userRole === 'buyer') {
      query = `
        SELECT 
          status,
          COUNT(*) as count,
          SUM(total_amount) as total
        FROM orders
        WHERE user_id = ?
        GROUP BY status
      `;
      params = [userId];
    } else {
      // Seller
      query = `
        SELECT 
          o.status,
          COUNT(DISTINCT o.order_id) as count,
          SUM(oi.subtotal) as total
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE oi.seller_id = ?
        GROUP BY o.status
      `;
      params = [userId];
    }
    
    const [stats] = await pool.query(query, params);
    
    // Format kết quả
    const result = {
      pending: { count: 0, total: 0 },
      confirmed: { count: 0, total: 0 },
      processing: { count: 0, total: 0 },
      shipping: { count: 0, total: 0 },
      delivered: { count: 0, total: 0 },
      cancelled: { count: 0, total: 0 },
    };
    
    stats.forEach(stat => {
      result[stat.status] = {
        count: parseInt(stat.count),
        total: parseFloat(stat.total || 0),
      };
    });
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    next(error);
  }
};

// Thống kê doanh thu cho người bán
exports.getRevenueStats = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { period = 'day', year, month } = req.query;
    
    let query;
    let params = [sellerId];
    
    if (period === 'day') {
      // Thống kê theo ngày trong tháng
      const selectedYear = year || new Date().getFullYear();
      const selectedMonth = month || (new Date().getMonth() + 1);
      
      query = `
        SELECT 
          DAY(o.order_date) as day,
          DATE(o.order_date) as date,
          COUNT(DISTINCT o.order_id) as order_count,
          SUM(oi.subtotal) as revenue,
          SUM(oi.quantity) as products_sold
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE oi.seller_id = ?
          AND YEAR(o.order_date) = ?
          AND MONTH(o.order_date) = ?
          AND o.status IN ('paid', 'shipped', 'delivered')
        GROUP BY DATE(o.order_date), DAY(o.order_date)
        ORDER BY date ASC
      `;
      params.push(selectedYear, selectedMonth);
      
    } else if (period === 'month') {
      // Thống kê theo tháng trong năm
      const selectedYear = year || new Date().getFullYear();
      
      query = `
        SELECT 
          MONTH(o.order_date) as month,
          COUNT(DISTINCT o.order_id) as order_count,
          SUM(oi.subtotal) as revenue,
          SUM(oi.quantity) as products_sold
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE oi.seller_id = ?
          AND YEAR(o.order_date) = ?
          AND o.status IN ('paid', 'shipped', 'delivered')
        GROUP BY MONTH(o.order_date)
        ORDER BY month ASC
      `;
      params.push(selectedYear);
      
    } else if (period === 'year') {
      // Thống kê theo năm
      query = `
        SELECT 
          YEAR(o.order_date) as year,
          COUNT(DISTINCT o.order_id) as order_count,
          SUM(oi.subtotal) as revenue,
          SUM(oi.quantity) as products_sold
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE oi.seller_id = ?
          AND o.status IN ('paid', 'shipped', 'delivered')
        GROUP BY YEAR(o.order_date)
        ORDER BY year ASC
      `;
    }
    
    const [stats] = await pool.query(query, params);
    
    // Lấy tổng quan
    const [summary] = await pool.query(`
      SELECT 
        COUNT(DISTINCT o.order_id) as total_orders,
        SUM(oi.subtotal) as total_revenue,
        SUM(oi.quantity) as total_products_sold,
        AVG(oi.subtotal) as avg_order_value
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE oi.seller_id = ?
        AND o.status IN ('paid', 'shipped', 'delivered')
    `, [sellerId]);
    
    // Lấy top sản phẩm bán chạy
    const [topProducts] = await pool.query(`
      SELECT 
        p.product_id,
        p.name,
        p.price,
        SUM(oi.quantity) as sold_quantity,
        SUM(oi.subtotal) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN orders o ON oi.order_id = o.order_id
      WHERE oi.seller_id = ?
        AND o.status IN ('paid', 'shipped', 'delivered')
      GROUP BY p.product_id, p.name, p.price
      ORDER BY sold_quantity DESC
      LIMIT 10
    `, [sellerId]);
    
    res.json({
      success: true,
      data: {
        period,
        stats: stats.map(stat => ({
          ...stat,
          revenue: parseFloat(stat.revenue || 0),
          order_count: parseInt(stat.order_count || 0),
          products_sold: parseInt(stat.products_sold || 0)
        })),
        summary: {
          total_orders: parseInt(summary[0].total_orders || 0),
          total_revenue: parseFloat(summary[0].total_revenue || 0),
          total_products_sold: parseInt(summary[0].total_products_sold || 0),
          avg_order_value: parseFloat(summary[0].avg_order_value || 0)
        },
        topProducts: topProducts.map(p => ({
          ...p,
          price: parseFloat(p.price),
          sold_quantity: parseInt(p.sold_quantity),
          revenue: parseFloat(p.revenue)
        }))
      }
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    next(error);
  }
};
