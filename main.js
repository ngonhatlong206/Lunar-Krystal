const fs = require("fs");
const path = require("path");
const login = require("fca-horizon-remastered");

// Đọc appstate từ biến môi trường
const envAppState = process.env.APPSTATE;
if (!envAppState) {
  console.error("❌ Không tìm thấy biến môi trường APPSTATE.");
  process.exit(1);
}

let appState;
try {
  appState = JSON.parse(envAppState);
  fs.writeFileSync(path.join(__dirname, "appstate.json"), JSON.stringify(appState, null, 2));
  console.log("✅ Đã ghi appstate.json từ biến môi trường.");
} catch (err) {
  console.error("❌ APPSTATE không hợp lệ:", err.message);
  process.exit(1);
}

login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Đăng nhập thất bại:", err);
    return;
  }
  console.log("✅ Đăng nhập thành công với c_user:", appState.find(c => c.key === "c_user")?.value);
  api.listenMqtt((err, event) => {
    if (err) return console.error("Lỗi khi lắng nghe tin nhắn:", err);
    console.log("[RECV]", event);
  });
});
