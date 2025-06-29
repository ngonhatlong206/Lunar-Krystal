const { spawn } = require("child_process");
const { readFileSync } = require("fs-extra");
const http = require("http");
const axios = require("axios");
const semver = require("semver");
const logger = require("./utils/log");
const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');
const express = require("express");
const cookieApi = require("./api/updateCookie");
///////////////////////////////////////////////////////////
//========= Create website for dashboard/uptime =========//
///////////////////////////////////////////////////////////
const PORT = process.env.PORT || 2025;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', cookieApi);

// Define a route
app.get('/', (request, response) => {
    const result = `Nhớ ib Facebook Lương Trường Khôi để cập nhật file nha (free) Facebook: https://www.facebook.com/LunarKrystal.Dev`;
    response.send(result);
});

// Cookie update page
app.get('/update-cookie', (request, response) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Update Cookie - Krystal Bot</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .container { background: #f5f5f5; padding: 20px; border-radius: 10px; }
            textarea { width: 100%; height: 100px; margin: 10px 0; padding: 10px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .result { margin-top: 20px; padding: 10px; border-radius: 5px; }
            .success { background: #d4edda; color: #155724; }
            .error { background: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🍪 Update Cookie - Krystal Bot</h1>
            <p><strong>Hướng dẫn lấy cookie:</strong></p>
            <ol>
                <li>Mở Facebook trên browser</li>
                <li>F12 > Application > Cookies > facebook.com</li>
                <li>Copy tất cả cookie (Ctrl+A, Ctrl+C)</li>
                <li>Paste vào ô bên dưới</li>
            </ol>
            
            <form id="cookieForm">
                <label for="cookie"><strong>Cookie String:</strong></label><br>
                <textarea id="cookie" name="cookie" placeholder="Paste cookie string here..."></textarea><br>
                <button type="submit">Update Cookie & Restart Bot</button>
            </form>
            
            <div id="result"></div>
        </div>
        
        <script>
            document.getElementById('cookieForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const cookie = document.getElementById('cookie').value;
                const resultDiv = document.getElementById('result');
                
                if (!cookie) {
                    resultDiv.innerHTML = '<div class="result error">Vui lòng nhập cookie!</div>';
                    return;
                }
                
                try {
                    const response = await fetch('/api/update-cookie', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cookie: cookie })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        resultDiv.innerHTML = '<div class="result success">✅ ' + data.message + '</div>';
                        document.getElementById('cookie').value = '';
                    } else {
                        resultDiv.innerHTML = '<div class="result error">❌ ' + data.message + '</div>';
                    }
                } catch (error) {
                    resultDiv.innerHTML = '<div class="result error">❌ Lỗi kết nối: ' + error.message + '</div>';
                }
            });
        </script>
    </body>
    </html>
    `;
    response.send(html);
});

// Start the server
app.listen(PORT, () => {
    console.log(chalk.red(`[ SECURITY ] -> Máy chủ khởi động tại port: ${PORT}`));
    console.log(chalk.green(`[ API ] -> Cookie update page: http://localhost:${PORT}/update-cookie`));
});

function startBot(message) {
    (message) ? logger(message, "BOT STARTING") : "";

    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

   child.on("close",async (codeExit) => {
      var x = 'codeExit'.replace('codeExit',codeExit);
        if (codeExit == 1) return startBot("Đang Khởi Động Lại, Vui Lòng Chờ ...");
         else if (x.indexOf(2) == 0) {
           await new Promise(resolve => setTimeout(resolve, parseInt(x.replace(2,'')) * 1000));
                 startBot("Bot has been activated please wait a moment!!!");
       }
         else return; 
    });

    child.on("error", function (error) {
        logger("An error occurred: " + JSON.stringify(error), "[ Starting ]");
    });
};

console.log(chalk.yellow(figlet.textSync('KRYSTAL', { horizontalLayout: 'full' })));
console.log(chalk.green("Lương Trường Khôi chúc bạn sử dụng file vui vẻ!"))
startBot()