const fs = require('fs');
const path = require('path');

/**
 * Script để cập nhật appstate từ cookie string
 * Sử dụng: node updateAppState.js "cookie_string_here"
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
    const appStatePath = path.join(process.cwd(), 'appstate.json');
    fs.writeFileSync(appStatePath, JSON.stringify(appState, null, 2), 'utf8');
    console.log('✅ Đã cập nhật file appstate.json');
}

function generateEnvironmentVariable(appState) {
    const appStateString = JSON.stringify(appState);
    console.log('\n📋 Environment Variable để thêm vào Render:');
    console.log('FACEBOOK_APPSTATE=' + appStateString);
    console.log('\n💡 Hướng dẫn:');
    console.log('1. Copy dòng FACEBOOK_APPSTATE ở trên');
    console.log('2. Vào Render Dashboard > Your App > Environment');
    console.log('3. Thêm variable mới với key: FACEBOOK_APPSTATE');
    console.log('4. Paste value vào và save');
    console.log('5. Redeploy app');
}

function main() {
    const cookieString = process.argv[2];
    
    if (!cookieString) {
        console.log('❌ Vui lòng cung cấp cookie string!');
        console.log('Sử dụng: node updateAppState.js "cookie_string_here"');
        console.log('\n📖 Cách lấy cookie:');
        console.log('1. Mở Facebook trên browser');
        console.log('2. F12 > Application > Cookies > https://www.facebook.com');
        console.log('3. Copy tất cả cookie (Ctrl+A, Ctrl+C)');
        console.log('4. Paste vào lệnh trên');
        return;
    }
    
    try {
        console.log('🔄 Đang chuyển đổi cookie thành appstate...');
        const appState = cookieToAppState(cookieString);
        
        if (appState.length === 0) {
            console.log('❌ Không tìm thấy cookie hợp lệ!');
            return;
        }
        
        console.log(`✅ Đã tìm thấy ${appState.length} cookies`);
        
        // Cập nhật file appstate.json
        updateAppStateFile(appState);
        
        // Tạo environment variable
        generateEnvironmentVariable(appState);
        
        console.log('\n🎉 Hoàn thành! Bạn có thể:');
        console.log('- Sử dụng file appstate.json để test locally');
        console.log('- Sử dụng environment variable để deploy lên Render');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }
}

main(); 