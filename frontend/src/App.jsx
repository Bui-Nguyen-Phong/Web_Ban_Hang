import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar/Navbar';

// Pages
import Home from './pages/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChangePassword from './components/Auth/ChangePassword';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';

// Buyer Pages
import BuyerDashboard from './pages/Buyer/BuyerDashboard';
import BuyerProfile from './pages/Buyer/BuyerProfile';
import BuyerOrders from './pages/Buyer/BuyerOrders';
import OrderDetail from './pages/Buyer/OrderDetail';
import EditProfile from './pages/Buyer/EditProfile';

// Seller Pages
import SellerDashboard from './pages/Seller/SellerDashboard';
import SellerProfile from './pages/Seller/SellerProfile';
import SellerProducts from './pages/Seller/SellerProducts';
import SellerOrders from './pages/Seller/SellerOrders';
import SellerOrderDetail from './pages/Seller/SellerOrderDetail';
import EditSellerProfile from './pages/Seller/EditSellerProfile';
import RevenueStats from './pages/Seller/RevenueStats';
import AddProduct from './pages/Seller/AddProduct';
import EditProduct from './pages/Seller/EditProduct';

// Product Pages
import ProductList from './pages/Products/ProductList';
import ProductDetail from './pages/Products/ProductDetail';

// Cart & Order Pages
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Navbar />
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Product Routes - Public */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Protected Routes - Change Password (cho cả buyer và seller) */}
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            {/* Cart & Checkout */}
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            {/* Buyer Routes */}
            <Route
              path="/buyer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/profile"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/edit-profile"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/orders"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />

            {/* Seller Routes */}
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/profile"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/edit-profile"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <EditSellerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/products"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/orders"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/orders/:id"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerOrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/revenue-stats"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <RevenueStats />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/products/add"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/products/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <EditProduct />
                </ProtectedRoute>
              }
            />

            {/* 404 - Not Found */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
