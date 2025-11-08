import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Cấu hình axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  // Đăng ký
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng nhập
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Kiểm tra xem đã đăng nhập chưa
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Quên mật khẩu - gửi email
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đặt lại mật khẩu với token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// User Services
export const userService = {
  // Lấy thông tin profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      // Backend trả về response.data.user
      return response.data.user || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật thông tin profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      
      // Backend trả về response.data.user
      if (response.data.user) {
        // Cập nhật localStorage với user data mới
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đổi mật khẩu
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/users/change-password', {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Product Services
export const productService = {
  // Lấy danh sách categories
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách sản phẩm với filter và pagination
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy chi tiết sản phẩm
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (keyword, params = {}) => {
    try {
      const response = await api.get('/products/search', {
        params: { keyword, ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lọc sản phẩm theo category
  getProductsByCategory: async (category, params = {}) => {
    try {
      const response = await api.get(`/products/category/${category}`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách sản phẩm của người bán
  getSellerProducts: async (params = {}) => {
    try {
      const response = await api.get('/products/seller/my-products', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo sản phẩm mới
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // TODO: Upload ảnh sản phẩm lên Pinata IPFS
  uploadProductImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/upload/product-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // TODO: Upload nhiều ảnh lên Pinata IPFS
  uploadProductImages: async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      const response = await api.post('/upload/product-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // TODO: Xóa ảnh từ Pinata (unpin IPFS)
  deleteImage: async (ipfsHash) => {
    try {
      const response = await api.delete(`/upload/${ipfsHash}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Cart Services
export const cartService = {
  // Lấy giỏ hàng
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await api.post('/cart/items', { productId, quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ
  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    try {
      const response = await api.delete('/cart');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Order Services
export const orderService = {
  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách đơn hàng của người mua
  getBuyerOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders/buyer/my-orders', { params });
      // Backend trả về { success: true, data: { orders: [], pagination: {} } }
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách đơn hàng của người bán
  getSellerOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders/seller/my-orders', { params });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy chi tiết đơn hàng
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      // Backend trả về { success: true, data: {...} }
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật trạng thái đơn hàng (seller)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Hủy đơn hàng (buyer) - OLD endpoint, cần update
  cancelOrder: async (orderId, reason) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel-buyer`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // BUYER: Xác nhận đã nhận hàng
  confirmDelivery: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/confirm-delivery`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // SELLER: Xác nhận đơn hàng
  confirmOrder: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/confirm`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // SELLER: Bắt đầu chuẩn bị hàng
  startProcessing: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/start-processing`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // SELLER: Bắt đầu giao hàng
  startShipping: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/start-shipping`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // SELLER: Hủy đơn hàng
  cancelOrderBySeller: async (orderId, reason) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel-seller`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thống kê đơn hàng
  getOrderStats: async () => {
    try {
      const response = await api.get('/orders/buyer/stats');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thống kê đơn hàng seller
  getSellerOrderStats: async () => {
    try {
      const response = await api.get('/orders/seller/stats');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thống kê doanh thu seller (mới)
  getRevenueStats: async (params = {}) => {
    try {
      const response = await api.get('/orders/seller/revenue-stats', { params });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// TODO: Payment Services (VNPAY)
export const paymentService = {
  // Tạo payment URL VNPAY
  createVNPayPayment: async (orderId) => {
    try {
      const response = await api.post('/payment/vnpay/create', { orderId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify payment return từ VNPAY
  verifyVNPayReturn: async (queryParams) => {
    try {
      const response = await api.get('/payment/vnpay/return', {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy thông tin transaction
  getTransaction: async (orderId) => {
    try {
      const response = await api.get(`/payment/transaction/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;
