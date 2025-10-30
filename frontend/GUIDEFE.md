# Web Bán Hàng - Frontend

Frontend cho ứng dụng web bán hàng với tính năng quản lý người mua và người bán riêng biệt.

## Tính năng

### Chung
- ✅ Đăng ký tài khoản (Người mua/Người bán)
- ✅ Đăng nhập
- ✅ Đăng xuất
- ✅ Đổi mật khẩu
- ✅ Quản lý thông tin cá nhân

### Người Mua (Buyer)
- ✅ Dashboard người mua
- ✅ Xem và cập nhật profile
- 🔜 Xem danh sách sản phẩm
- 🔜 Giỏ hàng
- 🔜 Đặt hàng
- 🔜 Theo dõi đơn hàng

### Người Bán (Seller)
- ✅ Dashboard người bán
- ✅ Xem và cập nhật thông tin cửa hàng
- 🔜 Quản lý sản phẩm (CRUD)
- 🔜 Quản lý đơn hàng
- 🔜 Thống kê doanh thu

## Thông tin User trong Database

Mỗi user có các trường sau:
- `fullName`: Họ và tên (hoặc tên cửa hàng với seller)
- `email`: Email (unique, dùng để đăng nhập)
- `password`: Mật khẩu (đã được hash)
- `phone`: Số điện thoại
- `address`: Địa chỉ
- `role`: Vai trò (`buyer` hoặc `seller`)

## Công nghệ sử dụng

- **React 18**: Library chính
- **React Router v6**: Routing và navigation
- **Axios**: HTTP client để gọi API
- **Vite**: Build tool và dev server
- **CSS thuần**: Styling (không dùng framework CSS)

## Cấu trúc thư mục

```
frontend/
├── public/              # Static files
├── src/
│   ├── assets/         # Images, icons
│   ├── components/     # React components
│   │   ├── Auth/       # Login, Register, ChangePassword
│   │   └── Navbar/     # Navigation bar
│   ├── contexts/       # React Context (AuthContext)
│   ├── pages/          # Page components
│   │   ├── Buyer/      # Buyer pages
│   │   ├── Seller/     # Seller pages
│   │   └── Home/       # Homepage
│   ├── routes/         # Route protection
│   ├── services/       # API services
│   ├── App.jsx         # Root component
│   ├── App.css         # Global styles
│   └── main.jsx        # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Cài đặt và Chạy

### 1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

### 3. Build cho production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## API Endpoints (Backend cần implement)

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### User Management
- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile
- `PUT /api/users/change-password` - Đổi mật khẩu

## Routes

### Public Routes
- `/` - Trang chủ
- `/login` - Đăng nhập
- `/register` - Đăng ký

### Protected Routes (Buyer)
- `/buyer/dashboard` - Dashboard người mua
- `/buyer/profile` - Profile người mua

### Protected Routes (Seller)
- `/seller/dashboard` - Dashboard người bán
- `/seller/profile` - Profile người bán

### Shared Protected Routes
- `/change-password` - Đổi mật khẩu (cả buyer và seller)

## Authentication Flow

1. User đăng ký/đăng nhập
2. Backend trả về token (JWT) và thông tin user
3. Token được lưu vào localStorage
4. Mỗi request API sẽ tự động gửi token trong header
5. Protected routes kiểm tra authentication và role
6. Nếu không có quyền, redirect về trang phù hợp

## Lưu ý

- Backend API phải chạy ở `http://localhost:5000`
- Vite proxy sẽ forward request `/api/*` đến backend
- Token được lưu trong localStorage
- Cần implement backend API tương ứng để frontend hoạt động

## Todo

- [ ] Thêm tính năng quên mật khẩu
- [ ] Thêm validation form nâng cao
- [ ] Thêm loading states
- [ ] Thêm error boundaries
- [ ] Thêm unit tests
- [ ] Responsive design cho mobile

## License

MIT
