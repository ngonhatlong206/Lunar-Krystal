const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

/**
 * Script cập nhật cookie nhanh - KHÔNG CẦN DEPLOY
 * Sử dụng: node quickUpdate.js "cookie_string_here"
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

function restartBot() {
    return new Promise((resolve) => {
        console.log('🔄 Đang restart bot...');
        
        // Kill process cũ
        exec('pkill -f "node.*main.js"', (error) => {
            if (error) {
                console.log('ℹ️  Không tìm thấy process cũ');
            } else {
                console.log('✅ Đã dừng bot cũ');
            }
            
            // Start bot mới sau 2 giây
            setTimeout(() => {
                console.log('🚀 Đang khởi động bot mới...');
                const child = spawn('node', ['main.js'], {
                    cwd: __dirname,
                    stdio: 'inherit',
                    shell: true
                });
                
                child.on('error', (error) => {
                    console.error('❌ Lỗi khởi động bot:', error.message);
                });
                
                child.on('close', (code) => {
                    if (code !== 0) {
                        console.log(`⚠️  Bot đã dừng với code: ${code}`);
                        console.log('🔄 Tự động restart sau 5 giây...');
                        setTimeout(() => restartBot(), 5000);
                    }
                });
                
                resolve();
            }, 2000);
        });
    });
}

async function main() {
    const cookieString = process.argv[2];
    
    if (!cookieString) {
        console.log('🍪 QUICK UPDATE COOKIE TOOL');
        console.log('===========================\n');
        console.log('❌ Vui lòng cung cấp cookie string!');
        console.log('Sử dụng: node quickUpdate.js "cookie_string_here"');
        console.log('\n💡 Cách lấy cookie:');
        console.log('1. F12 > Application > Cookies > facebook.com');
        console.log('2. Copy tất cả cookie (Ctrl+A, Ctrl+C)');
        console.log('3. Paste vào lệnh trên');
        console.log('\n🎯 Script này sẽ:');
        console.log('- Cập nhật cookie vào appstate.json');
        console.log('- Restart bot tự động');
        console.log('- Không cần deploy lại');
        return;
    }
    
    try {
        console.log('🍪 QUICK UPDATE COOKIE TOOL');
        console.log('===========================\n');
        
        // Bước 1: Chuyển đổi cookie
        console.log('🔄 Đang chuyển đổi cookie...');
        const appState = cookieToAppState(cookieString);
        
        if (appState.length === 0) {
            console.log('❌ Không tìm thấy cookie hợp lệ!');
            return;
        }
        
        // Bước 2: Cập nhật file
        updateAppStateFile(appState);
        
        // Bước 3: Hỏi có muốn restart không
        console.log('\n⚠️  Bạn có muốn restart bot ngay bây giờ? (y/n)');
        process.stdin.once('data', async (data) => {
            const answer = data.toString().trim().toLowerCase();
            
            if (answer === 'y' || answer === 'yes') {
                await restartBot();
                console.log('\n🎉 Hoàn thành! Bot đã được cập nhật và restart.');
                console.log('⏰ Vui lòng chờ 1-2 phút để bot login hoàn tất.');
            } else {
                console.log('\n✅ Đã cập nhật cookie thành công!');
                console.log('💡 Để restart bot sau, chạy: node restartBot.js');
            }
        });
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }
}

main(); 