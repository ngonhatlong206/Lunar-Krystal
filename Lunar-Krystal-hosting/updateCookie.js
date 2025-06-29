const fs = require('fs');
const path = require('path');

/**
 * Script cập nhật cookie thủ công - KHÔNG CẦN DEPLOY
 * Sử dụng: node updateCookie.js "cookie_string_here"
 */

function cookieToAppState(cookieString) {
    const cookies = cookieString.split(';').map(cookie => cookie.trim());
    const appState = [];
    
    for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key && value) {
            appState.push({
                key: key.trim(),
                value: value.trim(),
                domain: '.facebook.com',
                path: '/',
                secure: true,
                httpOnly: true
            });
        }
    }
    
    return appState;
}

function updateAppStateFile(appState) {
    const appStatePath = path.join(__dirname, 'appstate.json');
    fs.writeFileSync(appStatePath, JSON.stringify(appState, null, 2), 'utf8');
    console.log('✅ Đã cập nhật file appstate.json');
    console.log(`📊 Số lượng cookies: ${appState.length}`);
}

function main() {
    const cookieString = process.argv[2];
    
    if (!cookieString) {
        console.log('❌ Vui lòng cung cấp cookie string!');
        console.log('Sử dụng: node updateCookie.js "cookie_string_here"');
        console.log('\n💡 Cách lấy cookie:');
        console.log('1. F12 > Application > Cookies > facebook.com');
        console.log('2. Copy tất cả cookie (Ctrl+A, Ctrl+C)');
        console.log('3. Paste vào lệnh trên');
        return;
    }
    
    try {
        console.log('🔄 Đang cập nhật cookie...');
        const appState = cookieToAppState(cookieString);
        
        if (appState.length === 0) {
            console.log('❌ Không tìm thấy cookie hợp lệ!');
            return;
        }
        
        updateAppStateFile(appState);
        
        console.log('\n🎉 Hoàn thành! Bot sẽ tự động restart và sử dụng cookie mới.');
        console.log('⏰ Vui lòng chờ 1-2 phút để bot khởi động lại.');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }
}

main(); 