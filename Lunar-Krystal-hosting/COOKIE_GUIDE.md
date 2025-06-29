# 🍪 Hướng dẫn thay cookie thủ công - KHÔNG CẦN DEPLOY

## 🚀 Cách nhanh nhất

```bash
# 1. Lấy cookie từ Facebook
# F12 > Application > Cookies > facebook.com > Copy tất cả

# 2. Cập nhật và restart bot
node quickUpdate.js "your_cookie_string_here"
```

## 📋 Các script có sẵn

### `quickUpdate.js` - Tất cả trong một
```bash
node quickUpdate.js "cookie_string"
```
- ✅ Cập nhật cookie
- ✅ Restart bot tự động
- ✅ Không cần deploy

### `updateCookie.js` - Chỉ cập nhật cookie
```bash
node updateCookie.js "cookie_string"
```
- ✅ Chỉ cập nhật file appstate.json
- ❌ Không restart bot

### `restartBot.js` - Chỉ restart bot
```bash
node restartBot.js
```
- ✅ Restart bot sau khi đã cập nhật cookie
- ❌ Không cập nhật cookie

## 💡 Cách lấy cookie

1. **Mở Facebook** trên browser
2. **Đăng nhập** vào tài khoản
3. **F12** để mở Developer Tools
4. **Application** tab > **Cookies** > **https://www.facebook.com**
5. **Copy tất cả** (Ctrl+A, Ctrl+C)

## ⚠️ Lưu ý

- 🔒 Cookie có thời hạn (30-60 ngày)
- 🔒 Không chia sẻ cookie với người khác
- 🔒 Sử dụng tài khoản Facebook thật
- ⏰ Bot sẽ tự động restart sau khi cập nhật

## 🆘 Troubleshooting

### Bot không login được
- Kiểm tra cookie có hợp lệ không
- Thử tài khoản khác không có 2FA
- Tắt 2FA tạm thời

### Lỗi "Không tìm thấy cookie"
- Kiểm tra format cookie
- Đảm bảo copy đầy đủ từ browser

---

**🎉 Chúc bạn sử dụng bot vui vẻ!** 