import { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      // Xóa cart khi chưa đăng nhập
      setCart([]);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await cartService.getCart();
      setCart(data.items || []);
    } catch (err) {
      setError(err.message);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    setError(null);

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.find((item) => item.product.id === product.id);

    try {
      if (existingItem) {
        // Cập nhật số lượng
        await cartService.updateCartItem(
          existingItem.id,
          existingItem.quantity + quantity
        );
      } else {
        // Thêm mới
        await cartService.addToCart(product.id, quantity);
      }
      await loadCart();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) return;
    
    setError(null);

    if (quantity < 1) {
      return removeFromCart(itemId);
    }

    try {
      await cartService.updateCartItem(itemId, quantity);
      await loadCart();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) return;
    
    setError(null);

    try {
      await cartService.removeFromCart(itemId);
      await loadCart();
    } catch (err) {
      setError(err.message);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    
    setError(null);

    try {
      await cartService.clearCart();
      setCart([]);
    } catch (err) {
      setError(err.message);
      setCart([]);
    }
  };

  // Tính toán
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const value = {
    cart,
    loading,
    error,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
