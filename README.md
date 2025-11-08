# Web Bán Hàng - E-Commerce Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8+-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Nền tảng thương mại điện tử fullstack với quản lý riêng biệt cho **Người mua** và **Người bán**.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt nhanh](#cài-đặt-nhanh)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Endpoints](#api-endpoints)
- [Tài khoản mẫu](#tài-khoản-mẫu)
- [Troubleshooting](#troubleshooting)
- [Phát triển thêm](#phát-triển-thêm)

## 🎯 Tổng quan

Web Bán Hàng là nền tảng thương mại điện tử fullstack với:
- **Frontend**: React + Vite (Port 3000)
- **Backend**: Node.js + Express (Port 5000)
- **Database**: MySQL
- **Authentication**: JWT với phân quyền buyer/seller

## ✨ Tính năng

### 🔐 Authentication & Authorization
- [x] Đăng ký tài khoản (Người mua/Người bán)
- [x] Đăng nhập/Đăng xuất với JWT
- [x] Quên mật khẩu (Reset qua email)
- [x] Đổi mật khẩu
- [x] Protected routes theo role

### 👤 Quản lý User
- [x] Xem và cập nhật thông tin cá nhân
- [x] Profile riêng cho Buyer và Seller
- [x] Dashboard riêng theo role

### 🛒 Người Mua (Buyer)
- [x] Xem danh sách sản phẩm với phân trang
- [x] Tìm kiếm và lọc sản phẩm (tên, giá, danh mục)
- [x] Xem chi tiết sản phẩm
- [x] Thêm sản phẩm vào giỏ hàng
- [x] Quản lý giỏ hàng (thêm, sửa, xóa)
- [x] Đặt hàng và thanh toán
- [x] Xem lịch sử đơn hàng
- [x] Hủy đơn hàng (chỉ khi pending)
- [x] Theo dõi trạng thái đơn hàng

### 🏪 Người Bán (Seller)
- [x] Dashboard người bán
- [x] Thêm sản phẩm mới với ảnh và mô tả
- [x] Sửa/xóa sản phẩm
- [x] Quản lý tồn kho
- [x] Xem danh sách sản phẩm đã đăng
- [x] Xem đơn hàng chứa sản phẩm của mình
- [x] Cập nhật trạng thái đơn hàng
- [x] Quản lý thông tin cửa hàng

### 📦 Sản phẩm
- [x] Danh mục sản phẩm
- [x] Tìm kiếm theo tên
- [x] Lọc theo giá và danh mục
- [x] Sắp xếp (giá, tên, ngày)
- [x] Chi tiết sản phẩm với thông số kỹ thuật
- [x] Upload nhiều ảnh sản phẩm

### 💳 Thanh toán & Đơn hàng
- [x] Giỏ hàng với tính năng cập nhật số lượng
- [x] Checkout với thông tin giao hàng
- [x] Nhiều phương thức thanh toán (COD, Banking, E-wallet)
- [x] Tính phí ship tự động
- [x] Lịch sử đơn hàng với lọc theo trạng thái
- [x] Tracking đơn hàng (pending → confirmed → shipping → delivered)

## 🛠 Công nghệ sử dụng

### Frontend
- **React 18.2.0** - UI Library
- **React Router DOM 6.20.0** - Client-side routing
- **Axios 1.6.2** - HTTP requests
- **Vite 5.0.8** - Build tool và dev server
- **Context API** - State management (Auth, Cart)
- **CSS3** - Styling

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 4.18.2** - Web framework
- **MySQL 8+** - Relational database
- **MySQL2 3.6.5** - MySQL client với connection pooling
- **JWT (jsonwebtoken 9.0.2)** - Token-based authentication
- **Bcryptjs 2.4.3** - Password hashing
- **Nodemailer 6.9.7** - Email service
- **Multer 1.4.5** - File upload middleware
- **CORS 2.8.5** - Cross-origin resource sharing
- **Dotenv 16.3.1** - Environment variables

## 🏗 Yêu cầu hệ thống

- **Node.js** v16.0 trở lên
- **MySQL** v8.0 trở lên
- **npm** v7.0 trở lên

## 📁 Cấu trúc dự án

```
Web_Ban_Hang/
├── frontend/                    # React + Vite Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/            # Images
│   │   ├── components/        # React components
│   │   │   ├── Auth/          # Login, Register, Password
│   │   │   ├── Admin/         # Admin components
│   │   │   ├── Home/          # Home components
│   │   │   ├── Navbar/        # Navigation bar
│   │   │   └── Products/      # Product components
│   │   ├── contexts/          # Context API
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   └── CartContext.jsx    # Cart state
│   │   ├── pages/             # Page components
│   │   │   ├── Buyer/         # Buyer dashboard, orders
│   │   │   ├── Seller/        # Seller dashboard, products
│   │   │   ├── Cart/          # Shopping cart
│   │   │   ├── Checkout/      # Checkout page
│   │   │   ├── Home/          # Homepage
│   │   │   └── Products/      # Product list, detail
│   │   ├── routes/            # Protected routes
│   │   ├── services/          # API service layer
│   │   │   └── api.js         # Axios configuration
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Entry point
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── vite.config.js
│
├── backend/                    # Express + MySQL Backend
│   ├── config/
│   │   └── database.js        # MySQL connection pool
│   ├── controllers/           # Business logic
│   │   ├── authController.js      # Authentication
│   │   ├── userController.js      # User management
│   │   ├── productController.js   # Product CRUD
│   │   ├── cartController.js      # Cart operations
│   │   └── orderController.js     # Order management
│   ├── database/
│   │   └── schema.sql         # Database schema
│   ├── middleware/            # Express middleware
│   │   ├── auth.js            # JWT verification
│   │   └── error.js           # Error handling
│   ├── routes/                # API routes
│   │   ├── auth.js            # /api/auth/*
│   │   ├── users.js           # /api/users/*
│   │   ├── products.js        # /api/products/*
│   │   ├── cart.js            # /api/cart/*
│   │   └── orders.js          # /api/orders/*
│   ├── scripts/
│   │   └── initDatabase.js    # DB initialization
│   ├── utils/
│   │   └── jwt.js             # JWT utilities
│   ├── .env                   # Environment variables
│   ├── .env.example           # Environment template
│   ├── package.json
│   ├── server.js              # Express app entry
│   └── SETUP.md               # Setup documentation
│
└── README.md                  # This file
```

## � Cài đặt nhanh

### 1. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` và cập nhật MySQL password:
```env
DB_PASSWORD=your_mysql_password_here
```

Khởi tạo database:
```bash
npm run init-db
```

Chạy backend server:
```bash
npm run dev
```
Backend chạy tại: http://localhost:5000

### 2. Cài đặt Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend chạy tại: http://localhost:3000

### 3. Đăng nhập với tài khoản mẫu

**Người mua:**
- Email: buyer@example.com
- Password: password123

**Người bán:**
- Email: seller@example.com
- Password: password123

## 🎯 Tài khoản mẫu

Sau khi chạy `npm run init-db`, database sẽ có:
- **2 users**: 1 seller và 1 buyer
- **6 products**: Các sản phẩm mẫu trong danh mục điện tử

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu

### Users
- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile
- `PUT /api/users/change-password` - Đổi mật khẩu

### Products
- `GET /api/products` - Danh sách sản phẩm (public)
- `GET /api/products/:id` - Chi tiết sản phẩm (public)
- `GET /api/products/seller/my-products` - Sản phẩm của seller
- `POST /api/products` - Thêm sản phẩm (seller)
- `PUT /api/products/:id` - Sửa sản phẩm (seller)
- `DELETE /api/products/:id` - Xóa sản phẩm (seller)

### Cart
- `GET /api/cart` - Lấy giỏ hàng (buyer)
- `POST /api/cart/items` - Thêm vào giỏ (buyer)
- `PUT /api/cart/items/:id` - Cập nhật số lượng (buyer)
- `DELETE /api/cart/items/:id` - Xóa khỏi giỏ (buyer)
- `DELETE /api/cart` - Xóa toàn bộ giỏ (buyer)

### Orders
- `POST /api/orders` - Tạo đơn hàng (buyer)
- `GET /api/orders/buyer/my-orders` - Đơn hàng của buyer
- `GET /api/orders/seller/my-orders` - Đơn hàng của seller
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (seller)
- `PUT /api/orders/:id/cancel` - Hủy đơn hàng (buyer)

Chi tiết API xem tại `backend/SETUP.md`

#### Chạy cả Frontend và Backend cùng lúc
```bash
npm run dev
```

#### Hoặc chạy riêng lẻ

**Chỉ Frontend:**
```bash
npm run dev:frontend
# hoặc
cd frontend
npm run dev
```

**Chỉ Backend:**
```bash
npm run dev:backend
# hoặc
cd backend
npm run dev
```

### URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🔧 Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=web_ban_hang
DB_USER=root
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Reset Password
RESET_TOKEN_SECRET=your-reset-token-secret
RESET_TOKEN_EXPIRY=1h
FRONTEND_URL=http://localhost:3000
```

## 📝 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Đăng ký tài khoản | ❌ |
| POST | `/api/auth/login` | Đăng nhập | ❌ |
| POST | `/api/auth/forgot-password` | Quên mật khẩu | ❌ |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu | ❌ |
| GET | `/api/auth/me` | Lấy thông tin user | ✅ |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Lấy profile | ✅ |
| PUT | `/api/users/profile` | Cập nhật profile | ✅ |
| PUT | `/api/users/change-password` | Đổi mật khẩu | ✅ |

### Product Endpoints (Coming soon)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/products` | Lấy danh sách sản phẩm | ❌ | - |
| GET | `/api/products/:id` | Chi tiết sản phẩm | ❌ | - |
| POST | `/api/products` | Tạo sản phẩm mới | ✅ | Seller |
| PUT | `/api/products/:id` | Cập nhật sản phẩm | ✅ | Seller |
| DELETE | `/api/products/:id` | Xóa sản phẩm | ✅ | Seller |

### Order Endpoints (Coming soon)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/orders` | Lấy danh sách đơn hàng | ✅ | Both |
| GET | `/api/orders/:id` | Chi tiết đơn hàng | ✅ | Both |
| POST | `/api/orders` | Tạo đơn hàng mới | ✅ | Buyer |
| PUT | `/api/orders/:id` | Cập nhật trạng thái | ✅ | Seller |

Chi tiết API xem thêm tại: [API Documentation](./docs/API.md)

## 📱 Screenshots

### Homepage
![Homepage](./screenshots/homepage.png)

### Login & Register
![Login](./screenshots/login.png) ![Register](./screenshots/register.png)

### Buyer Dashboard
![Buyer Dashboard](./screenshots/buyer-dashboard.png)

### Seller Dashboard
![Seller Dashboard](./screenshots/seller-dashboard.png)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📦 Build & Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Build Backend
```bash
cd backend
npm run build
```

### Deploy
Chi tiết deployment xem tại: [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Đóng góp

Contributions, issues và feature requests đều được chào đón!

1. Fork dự án
2. Tạo branch cho feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📜 License

Dự án này được phân phối dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Authors

- **Bui Nguyen Phong** - *Initial work* - [@Bui-Nguyen-Phong](https://github.com/Bui-Nguyen-Phong)

## 🙏 Acknowledgments

- React Documentation
- Node.js Best Practices
- Express.js Guide
- MySQL Documentation
- Vite Documentation

## 📞 Liên hệ

- GitHub: [@Bui-Nguyen-Phong](https://github.com/Bui-Nguyen-Phong)
- Project Link: [https://github.com/Bui-Nguyen-Phong/Web_Ban_Hang](https://github.com/Bui-Nguyen-Phong/Web_Ban_Hang)

## 📈 Roadmap

### Phase 1 - Foundation (✅ Completed)
- [x] Setup project structure
- [x] Implement authentication system (JWT)
- [x] Create buyer & seller dashboards
- [x] Profile management
- [x] Forgot password feature
- [x] Protected routes with role-based access

### Phase 2 - Core Features (✅ Completed)
- [x] Product management (CRUD)
- [x] Shopping cart with quantity management
- [x] Order management system
- [x] Search & filtering (name, price, category)
- [x] Multiple product images support
- [x] Stock management
- [x] Order status tracking

### Phase 3 - Integration (✅ Completed)
- [x] Backend API with Express + MySQL
- [x] RESTful API endpoints
- [x] Database schema and relationships
- [x] Authentication middleware
- [x] Error handling
- [x] CORS configuration

### Phase 4 - Advanced Features (⬜ Planned)
- [ ] File upload for product images
- [ ] Email service for password reset
- [ ] Payment integration (VNPay, Momo)
- [ ] Real-time notifications (Socket.io)
- [ ] Review & rating system
- [ ] Wishlist feature
- [ ] Analytics dashboard for seller
- [ ] Voucher/discount system

### Phase 5 - Optimization (⬜ Future)
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Mobile responsive design
- [ ] Admin panel
- [ ] Caching with Redis
- [ ] CDN for images

---

**Made with ❤️ by Bui Nguyen Phong**
