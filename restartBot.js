const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script restart bot sau khi cập nhật cookie
 * Sử dụng: node restartBot.js
 */

function checkAppState() {
    const appStatePath = path.join(process.cwd(), 'appstate.json');
    
    if (!fs.existsSync(appStatePath)) {
        console.log('❌ Không tìm thấy file appstate.json');
        console.log('💡 Hãy chạy: node updateCookie.js "your_cookie" trước');
        return false;
    }
    
    try {
        const appState = JSON.parse(fs.readFileSync(appStatePath, 'utf8'));
        console.log(`✅ Tìm thấy ${appState.length} cookies trong appstate.json`);
        return true;
    } catch (error) {
        console.log('❌ File appstate.json có lỗi');
        return false;
    }
}

function restartBot() {
    console.log('🔄 Đang restart bot...');
    
    // Tìm và kill process cũ nếu có
    const { exec } = require('child_process');
    exec('pkill -f "node.*main.js"', (error) => {
        if (error) {
            console.log('ℹ️  Không tìm thấy process cũ để kill');
        } else {
            console.log('✅ Đã dừng bot cũ');
        }
        
        // Start bot mới
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
                    setTimeout(restartBot, 5000);
                }
            });
            
        }, 2000);
    });
}

function main() {
    console.log('🍪 BOT RESTART TOOL');
    console.log('==================\n');
    
    if (!checkAppState()) {
        return;
    }
    
    console.log('\n⚠️  Bạn có chắc muốn restart bot? (y/n)');
    process.stdin.once('data', (data) => {
        const answer = data.toString().trim().toLowerCase();
        
        if (answer === 'y' || answer === 'yes') {
            restartBot();
        } else {
            console.log('❌ Đã hủy restart');
            process.exit(0);
        }
    });
}

main(); 