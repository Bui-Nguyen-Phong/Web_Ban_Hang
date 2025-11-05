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
      // Load from localStorage nếu chưa đăng nhập
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    }
  }, [isAuthenticated]);

  // Sync cart to localStorage
  useEffect(() => {
    if (!isAuthenticated && cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const loadCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await cartService.getCart();
      setCart(data.items || []);
    } catch (err) {
      setError(err.message);
      // Use mock data nếu API chưa sẵn sàng
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    setError(null);

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (isAuthenticated) {
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
        // Fallback to local storage
        updateLocalCart(product, quantity);
        return false;
      }
    } else {
      // Không đăng nhập - lưu vào localStorage
      updateLocalCart(product, quantity);
      return true;
    }
  };

  const updateLocalCart = (product, quantity) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingIndex > -1) {
        // Cập nhật số lượng
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      } else {
        // Thêm mới
        return [
          ...prevCart,
          {
            id: Date.now(),
            product,
            quantity,
          },
        ];
      }
    });
  };

  const updateQuantity = async (itemId, quantity) => {
    setError(null);

    if (quantity < 1) {
      return removeFromCart(itemId);
    }

    if (isAuthenticated) {
      try {
        await cartService.updateCartItem(itemId, quantity);
        await loadCart();
      } catch (err) {
        setError(err.message);
        // Update local cart
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      }
    } else {
      // Update localStorage
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = async (itemId) => {
    setError(null);

    if (isAuthenticated) {
      try {
        await cartService.removeFromCart(itemId);
        await loadCart();
      } catch (err) {
        setError(err.message);
        // Remove from local cart
        setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
      }
    } else {
      // Remove from localStorage
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    }
  };

  const clearCart = async () => {
    setError(null);

    if (isAuthenticated) {
      try {
        await cartService.clearCart();
        setCart([]);
      } catch (err) {
        setError(err.message);
        setCart([]);
      }
    } else {
      setCart([]);
      localStorage.removeItem('cart');
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
