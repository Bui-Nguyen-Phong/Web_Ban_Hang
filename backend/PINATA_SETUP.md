# 🎯 Hướng dẫn Setup Pinata IPFS để Upload Ảnh Sản Phẩm

## Tại sao dùng Pinata?

✅ **Đơn giản hơn Google Drive**: Chỉ cần API key, không cần Service Account  
✅ **Miễn phí**: 1GB storage free  
✅ **Nhanh**: CDN toàn cầu  
✅ **IPFS**: Lưu trữ phi tập trung, không mất dữ liệu  
✅ **Không giới hạn bandwidth** (Free plan)

---

## Bước 1: Đăng ký tài khoản Pinata (2 phút)

1. Truy cập: https://app.pinata.cloud/register
2. Đăng ký bằng email hoặc Google
3. Xác nhận email
4. Đăng nhập vào dashboard

---

## Bước 2: Tạo API Key (1 phút)

1. Vào trang API Keys: https://app.pinata.cloud/developers/api-keys
2. Click nút **"New Key"** (góc trên bên phải)
3. Cấu hình permissions:
   - **Chọn "Admin"** (recommended) - Có tất cả quyền
   - Hoặc tick 3 permissions sau:
     - ✅ `pinFileToIPFS` (Upload file)
     - ✅ `pinJSONToIPFS` (Upload JSON)
     - ✅ `unpin` (Xóa file)
4. Đặt tên key: `web-ban-hang-upload` (hoặc tên bất kỳ)
5. Click **"Create Key"**
6. **QUAN TRỌNG**: Copy **JWT** (API Secret) ngay
   - Chỉ hiển thị 1 lần duy nhất
   - Nếu mất, phải tạo key mới

---

## Bước 3: Cấu hình Backend (30 giây)

1. Mở file `backend/.env`
2. Thêm dòng sau (thay `your_jwt_here` bằng JWT vừa copy):

```env
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJleGFtcGxlQGdtYWlsLmNvbSJ9...
```

**Ví dụ thực tế**:
```env
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24...
```

---

## Bước 4: Cài đặt Dependencies (1 phút)

```bash
cd backend
npm install axios form-data
```

---

## Bước 5: Restart Backend Server

```bash
npm run dev
```

Nếu thấy log:
```
✓ MySQL connected successfully
Server running on port 5000
```

→ Setup thành công! ✅

---

## Bước 6: Test Upload (2 phút)

1. Mở frontend: http://localhost:3000
2. Đăng nhập với tài khoản **seller**
3. Vào **"Quản lý sản phẩm"** → **"Thêm sản phẩm"**
4. Điền thông tin sản phẩm
5. Chọn ảnh (jpg, png, max 5MB)
6. Click **"Upload ảnh"**
7. Chờ loading... → Nhận thông báo **"Upload ảnh thành công!"**
8. Ảnh sẽ hiển thị preview từ Pinata Gateway

**URL ảnh sẽ có dạng**:
```
https://gateway.pinata.cloud/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx
```

---

## Kiểm tra trên Pinata Dashboard

1. Vào: https://app.pinata.cloud/pinmanager
2. Sẽ thấy file vừa upload với:
   - ✅ File name: `product_timestamp_filename.jpg`
   - ✅ IPFS Hash: `Qm...`
   - ✅ Size: X MB
   - ✅ Status: Pinned

---

## Troubleshooting

### ❌ Lỗi: "PINATA_JWT chưa được cấu hình"

**Nguyên nhân**: Chưa thêm JWT vào `.env` hoặc giá trị vẫn là `your_jwt_here`

**Giải pháp**:
1. Kiểm tra file `backend/.env`
2. Đảm bảo có dòng: `PINATA_JWT=eyJ...` (JWT thật)
3. Restart backend server

---

### ❌ Lỗi: "Invalid authentication token"

**Nguyên nhân**: JWT không đúng hoặc đã bị revoke

**Giải pháp**:
1. Vào Pinata dashboard → API Keys
2. Xóa key cũ
3. Tạo key mới
4. Copy JWT mới vào `.env`
5. Restart backend

---

### ❌ Lỗi: "Rate limit exceeded"

**Nguyên nhân**: Upload quá nhiều ảnh trong thời gian ngắn (Free plan có giới hạn)

**Giải pháp**:
- Đợi 1-2 phút rồi thử lại
- Hoặc upgrade lên paid plan

---

### ❌ Ảnh upload nhưng không hiển thị

**Nguyên nhân**: IPFS hash chưa được propagate trên gateway

**Giải pháp**:
- Đợi 10-30 giây
- Hoặc dùng public gateway khác:
  - `https://ipfs.io/ipfs/HASH`
  - `https://cloudflare-ipfs.com/ipfs/HASH`

---

## Free Plan Limits

| Feature | Free Plan |
|---------|-----------|
| Storage | 1 GB |
| Bandwidth | Unlimited |
| Uploads/month | Unlimited |
| Pin duration | Forever |
| Gateways | Public gateways |

**Đủ cho ~200-500 ảnh sản phẩm** (mỗi ảnh ~2-5MB)

---

## Bảo mật

⚠️ **QUAN TRỌNG**:

1. **KHÔNG commit** file `.env` lên Git
   - Đã có trong `.gitignore`
2. **KHÔNG chia sẻ** JWT với bất kỳ ai
3. Nếu JWT bị lộ:
   - Vào Pinata → Revoke key ngay
   - Tạo key mới

---

## So sánh với Google Drive

| Feature | Pinata IPFS | Google Drive API |
|---------|-------------|------------------|
| Setup | ⭐⭐⭐⭐⭐ Cực dễ | ⭐⭐ Phức tạp |
| Time to setup | 3 phút | 20-30 phút |
| Credentials | 1 JWT key | Service Account JSON + Folder ID |
| Storage | 1GB free | 15GB free |
| Bandwidth | Unlimited | Limited |
| CDN | ✅ Global | ❌ |
| Phi tập trung | ✅ IPFS | ❌ |

---

## Upgrade (Optional)

Nếu cần nhiều storage hơn:

**Picnic Plan**: $20/month
- 100 GB storage
- Dedicated gateway
- Priority support

**Tham khảo**: https://www.pinata.cloud/pricing

---

## Links hữu ích

- 📖 Pinata Docs: https://docs.pinata.cloud/
- 🔑 API Keys: https://app.pinata.cloud/developers/api-keys
- 📁 Pin Manager: https://app.pinata.cloud/pinmanager
- 💬 Discord Support: https://discord.gg/pinata

---

## ✅ Checklist Setup

- [ ] Đăng ký tài khoản Pinata
- [ ] Tạo API Key (JWT)
- [ ] Thêm `PINATA_JWT` vào `backend/.env`
- [ ] Chạy `npm install axios form-data`
- [ ] Restart backend server
- [ ] Test upload ảnh
- [ ] Kiểm tra ảnh trên Pinata dashboard

---

**Setup xong trong 5 phút! 🎉**
