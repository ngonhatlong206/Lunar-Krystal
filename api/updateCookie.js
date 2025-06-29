const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const router = express.Router();

/**
 * API endpoint để cập nhật cookie qua web
 * POST /api/update-cookie
 * Body: { "cookie": "your_cookie_string" }
 */

// Luôn ghi file appstate.json ở thư mục gốc project (dùng process.cwd())
function updateAppStateFile(appState) {
    const appStatePath = path.join(process.cwd(), 'appstate.json');
    fs.writeFileSync(appStatePath, JSON.stringify(appState, null, 2), 'utf8');
    return appState.length;
}

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

function restartBot() {
    // Render sẽ tự động restart app khi process.exit(0)
    process.exit(0);
}

router.post('/update-cookie', async (req, res) => {
    try {
        const { cookie } = req.body;
        
        if (!cookie) {
            return res.status(400).json({
                success: false,
                message: 'Cookie string is required'
            });
        }
        
        console.log('🔄 Updating cookie via API...');
        
        // Convert cookie to appstate
        const appState = cookieToAppState(cookie);
        
        if (appState.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cookie format'
            });
        }
        
        // Update file
        const cookieCount = updateAppStateFile(appState);
        
        console.log(`✅ Updated ${cookieCount} cookies via API`);
        
        // Restart bot (Render sẽ tự restart app)
        setTimeout(() => {
            restartBot();
        }, 1000);
        
        res.json({
            success: true,
            message: `Updated ${cookieCount} cookies successfully. Bot will restart in 1 second.`,
            cookieCount: cookieCount
        });
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET endpoint để kiểm tra trạng thái appstate.json
router.get('/status', (req, res) => {
    try {
        const appStatePath = path.join(process.cwd(), 'appstate.json');
        
        if (fs.existsSync(appStatePath)) {
            const appState = JSON.parse(fs.readFileSync(appStatePath, 'utf8'));
            res.json({
                success: true,
                cookieCount: appState.length,
                lastUpdated: fs.statSync(appStatePath).mtime
            });
        } else {
            res.json({
                success: false,
                message: 'No appstate.json found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reading appstate',
            error: error.message
        });
    }
});

// Endpoint tạm thời để xem nội dung appstate.json
router.get('/view-appstate', (req, res) => {
    const appStatePath = path.join(process.cwd(), 'appstate.json');
    if (!fs.existsSync(appStatePath)) {
        return res.status(404).json({ error: 'appstate.json not found' });
    }
    try {
        const content = fs.readFileSync(appStatePath, 'utf8');
        res.type('application/json').send(content);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Endpoint root trả về hướng dẫn sử dụng API
router.get('/', (req, res) => {
    res.json({
        message: 'Krystal Bot Cookie API',
        endpoints: {
            'POST /update-cookie': 'Cập nhật cookie Facebook cho bot',
            'GET /status': 'Kiểm tra trạng thái appstate.json',
            'GET /view-appstate': 'Xem nội dung file appstate.json (debug)'
        },
        note: 'Dán cookie string dạng key=value; key2=value2; ... vào POST /update-cookie.'
    });
});

module.exports = router; 