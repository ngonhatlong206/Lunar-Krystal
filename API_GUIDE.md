# 🌐 API Update Cookie - KHÔNG CẦN DEPLOY

## 🎯 **Cách sử dụng nhanh nhất:**

### **Bước 1: Truy cập trang web**
```
https://your-app-name.onrender.com/update-cookie
```

### **Bước 2: Lấy cookie từ Facebook**
1. Mở Facebook trên browser
2. F12 > Application > Cookies > facebook.com
3. Copy tất cả cookie (Ctrl+A, Ctrl+C)

### **Bước 3: Cập nhật cookie**
1. Paste cookie vào ô text
2. Click "Update Cookie & Restart Bot"
3. Bot sẽ tự động restart với cookie mới

## 🔧 **API Endpoints:**

### **POST /api/update-cookie**
```bash
curl -X POST https://your-app-name.onrender.com/api/update-cookie \
  -H "Content-Type: application/json" \
  -d '{"cookie": "your_cookie_string_here"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Updated 15 cookies successfully. Bot will restart in 1 second.",
  "cookieCount": 15
}
```

### **GET /api/status**
```bash
curl https://your-app-name.onrender.com/api/status
```

**Response:**
```json
{
  "success": true,
  "cookieCount": 15,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

## ✅ **Lợi ích:**

- 🚀 **Không cần deploy** - Chỉ cần truy cập web
- 💾 **Không mất dữ liệu** - Bot restart tự động
- 🔒 **Bảo mật** - Cookie không lưu trong code
- ⚡ **Nhanh chóng** - Chỉ mất 30 giây

## 🛠️ **Cách hoạt động:**

1. **Truy cập trang web** `/update-cookie`
2. **Paste cookie** vào form
3. **API xử lý** và cập nhật file `appstate.json`
4. **Bot restart** tự động với cookie mới
5. **Giữ nguyên** tất cả dữ liệu tin nhắn

## ⚠️ **Lưu ý:**

- 🔒 **Bảo mật trang web** - Chỉ bạn biết URL
- ⏰ **Thời gian restart** - Khoảng 1-2 phút
- 📱 **Tương thích** - Hoạt động trên mọi thiết bị
- 🔄 **Tự động** - Không cần thao tác thêm

## 🆘 **Troubleshooting:**

### **Lỗi "Invalid cookie format"**
- Kiểm tra cookie có đầy đủ không
- Đảm bảo copy từ Facebook đúng cách

### **Lỗi "Internal server error"**
- Thử lại sau 1-2 phút
- Kiểm tra logs trên Render

### **Bot không restart**
- Đợi 2-3 phút
- Kiểm tra trạng thái bot

---

**🎉 Bây giờ bạn có thể thay cookie dễ dàng qua web!** 