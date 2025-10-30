# Web Bán Hàng - E-Commerce Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Nền tảng thương mại điện tử fullstack với quản lý riêng biệt cho **Người mua** và **Người bán**.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt](#cài-đặt)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Đóng góp](#đóng-góp)
- [License](#license)

## 🎯 Tổng quan

Web Bán Hàng là một nền tảng thương mại điện tử được xây dựng với React và Node.js, cho phép:
- **Người mua**: Tìm kiếm, mua sắm sản phẩm, quản lý đơn hàng
- **Người bán**: Quản lý cửa hàng, sản phẩm, đơn hàng và doanh thu

## ✨ Tính năng

### 🔐 Authentication & Authorization
- [x] Đăng ký tài khoản (Người mua/Người bán)
- [x] Đăng nhập/Đăng xuất
- [x] Quên mật khẩu (Reset qua email)
- [x] Đổi mật khẩu
- [x] Protected routes theo role (buyer/seller)

### 👤 Quản lý User
- [x] Xem và cập nhật thông tin cá nhân
- [x] Profile riêng cho Buyer và Seller
- [x] Dashboard riêng theo role

### 🛒 Người Mua (Buyer)
- [x] Dashboard người mua
- [x] Quản lý thông tin cá nhân
- [ ] Tìm kiếm và xem sản phẩm
- [ ] Giỏ hàng
- [ ] Đặt hàng
- [ ] Theo dõi đơn hàng
- [ ] Danh sách yêu thích
- [ ] Đánh giá sản phẩm

### 🏪 Người Bán (Seller)
- [x] Dashboard người bán
- [x] Quản lý thông tin cửa hàng
- [ ] Quản lý sản phẩm (CRUD)
- [ ] Quản lý đơn hàng
- [ ] Thống kê doanh thu
- [ ] Báo cáo bán hàng

### 📦 Sản phẩm
- [ ] Danh mục sản phẩm
- [ ] Tìm kiếm và lọc
- [ ] Chi tiết sản phẩm
- [ ] Upload hình ảnh

### 💳 Thanh toán
- [ ] Giỏ hàng
- [ ] Checkout
- [ ] Thanh toán online
- [ ] Lịch sử đơn hàng

## 🛠 Công nghệ sử dụng

### Frontend
- **React 18.2** - UI Library
- **React Router v6** - Routing
- **Axios** - HTTP Client
- **Vite** - Build tool
- **CSS3** - Styling (không dùng framework)

### Backend (Dự kiến)
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM (hoặc TypeORM)
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service

## 📁 Cấu trúc dự án

```
Web_Ban_Hang/
├── frontend/                    # React Frontend
│   ├── public/                 # Static files
│   ├── src/
│   │   ├── assets/            # Images, icons
│   │   ├── components/        # React components
│   │   │   ├── Auth/          # Login, Register, etc.
│   │   │   └── Navbar/        # Navigation
│   │   ├── contexts/          # React Context (Auth)
│   │   ├── pages/             # Page components
│   │   │   ├── Buyer/         # Buyer pages
│   │   │   ├── Seller/        # Seller pages
│   │   │   └── Home/          # Homepage
│   │   ├── routes/            # Protected routes
│   │   ├── services/          # API services
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/                    # Node.js Backend (Coming soon)
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── config/            # Configuration
│   │   └── utils/             # Utilities
│   ├── package.json
│   └── README.md
│
├── .gitignore
├── package.json               # Root package.json
└── README.md                  # This file
```

## 💾 Database Schema (MySQL)

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('buyer', 'seller') NOT NULL DEFAULT 'buyer',
  reset_password_token VARCHAR(255),
  reset_password_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

### Products Table (Coming soon)
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  stock INT DEFAULT 0,
  seller_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_seller (seller_id),
  INDEX idx_category (category)
);
```

### Product Images Table (Coming soon)
```sql
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
);
```

### Orders Table (Coming soon)
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_buyer (buyer_id),
  INDEX idx_seller (seller_id),
  INDEX idx_status (status)
);
```

### Order Items Table (Coming soon)
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
);
```

## 🚀 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL >= 8.0 (cho backend)

### Clone repository
```bash
git clone https://github.com/Bui-Nguyen-Phong/Web_Ban_Hang.git
cd Web_Ban_Hang
```

### Cài đặt dependencies

#### Cài đặt tất cả (Root + Frontend + Backend)
```bash
npm run install:all
```

#### Hoặc cài đặt riêng lẻ

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

## 🎮 Chạy ứng dụng

### Development Mode

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
- MongoDB University
- Vite Documentation

## 📞 Liên hệ

- GitHub: [@Bui-Nguyen-Phong](https://github.com/Bui-Nguyen-Phong)
- Project Link: [https://github.com/Bui-Nguyen-Phong/Web_Ban_Hang](https://github.com/Bui-Nguyen-Phong/Web_Ban_Hang)

## 📈 Roadmap

### Phase 1 - Foundation (✅ Completed)
- [x] Setup project structure
- [x] Implement authentication system
- [x] Create buyer & seller dashboards
- [x] Profile management
- [x] Forgot password feature

### Phase 2 - Core Features (🚧 In Progress)
- [ ] Product management (CRUD)
- [ ] Shopping cart
- [ ] Order management
- [ ] Search & filtering
- [ ] Image upload

### Phase 3 - Advanced Features
- [ ] Payment integration
- [ ] Real-time notifications
- [ ] Chat system
- [ ] Review & rating system
- [ ] Analytics dashboard

### Phase 4 - Optimization
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Mobile app (React Native)
- [ ] Admin panel

---

**Made with ❤️ by Bui Nguyen Phong**
