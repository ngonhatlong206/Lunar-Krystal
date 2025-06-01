//////////////////////////////////////////////////////
//========= Require all variable need use =========//
/////////////////////////////////////////////////////
const moment = require("moment-timezone");
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync, rm } = require("fs-extra");
const { join, resolve } = require("path");
const chalk = require('chalk');
const figlet = require('figlet');
const { execSync } = require('child_process');
const logger = require("./utils/log.js");
const os = require('os');
const login = require("./includes/login");
const axios = require("axios");
const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
const listbuiltinModules = require("module").builtinModules;
const connect = require("./utils/ConnectApi.js");

global.client = new Object({
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    eventRegistered: new Array(),
    handleSchedule: new Array(),
    handleReaction: new Array(),
    handleReply: new Array(),
    mainPath: process.cwd(),
    configPath: new String(),
    getTime: function (option) {
        const time = moment.tz("Asia/Ho_Chi_minh");
        switch (option) {
            case "seconds": return time.format("ss");
            case "minutes": return time.format("mm");
            case "hours": return time.format("HH");
            case "date": return time.format("DD");
            case "month": return time.format("MM");
            case "year": return time.format("YYYY");
            case "fullHour": return time.format("HH:mm:ss");
            case "fullYear": return time.format("DD/MM/YYYY");
            case "fullTime": return time.format("HH:mm:ss DD/MM/YYYY");
        }
    }
});

global.data = {
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    threadAllowNSFW: [],
    allUserID: [],
    allCurrenciesID: [],
    allThreadID: []
};

global.utils = require("./utils");
global.nodemodule = {};
global.config = {};
global.configModule = {};
global.moduleData = [];
global.language = {};

// ========== Load Config ==========
try {
    global.client.configPath = join(global.client.mainPath, "config.json");
    const configValue = require(global.client.configPath);
    for (const key in configValue) global.config[key] = configValue[key];
    connect.send();
} catch (e) {
    const fallbackPath = global.client.configPath.replace(/\.json$/, "") + ".temp";
    if (existsSync(fallbackPath)) {
        const tempConfig = JSON.parse(readFileSync(fallbackPath));
        for (const key in tempConfig) global.config[key] = tempConfig[key];
        logger.loader(`Found: ${fallbackPath}`);
    } else {
        return logger.loader("Can't load file config!", "error");
    }
}

// ========== Ghi APPSTATE từ biến môi trường (nếu có) ==========
try {
    const envAppState = process.env.APPSTATE;
    if (envAppState) {
        const parsedAppState = JSON.parse(envAppState);
        const appstatePath = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
        writeFileSync(appstatePath, JSON.stringify(parsedAppState, null, 2), "utf8");
        console.log("[INFO] Đã ghi APPSTATE từ biến môi trường vào:", appstatePath);
    }
} catch (e) {
    console.error("[ERROR] Không thể phân tích APPSTATE từ biến môi trường:", e.message);
}

// ========== Load Ngôn ngữ ==========
try {
    const langFile = readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, "utf8").split(/\r?\n|\r/);
    const langData = langFile.filter(item => !item.startsWith("#") && item.trim() !== "");
    for (const item of langData) {
        const sep = item.indexOf('=');
        const head = item.slice(0, sep).split('.')[0];
        const key = item.slice(0, sep).replace(`${head}.`, '');
        const value = item.slice(sep + 1).replace(/\\n/gi, '\n');
        global.language[head] = global.language[head] || {};
        global.language[head][key] = value;
    }
} catch (e) {
    return logger.loader("Lỗi khi load ngôn ngữ.", "error");
}

global.getText = function (...args) {
    const [section, key, ...params] = args;
    if (!global.language[section]) throw `${__filename} - Không tìm thấy ngôn ngữ chính: ${section}`;
    let text = global.language[section][key];
    params.forEach((val, i) => text = text.replace(new RegExp(`%${i + 1}`, 'g'), val));
    return text;
};

// ========== Load APPSTATE từ file ==========
let appState;
try {
    const appStatePath = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
    appState = require(appStatePath);
} catch {
    return logger.loader(global.getText("mirai", "notFoundPathAppstate"), "error");
}

// ========== Tiếp tục phần khởi động bot ==========
/* GIỮ NGUYÊN các đoạn sau:
   - fetchAppState
   - onBot
   - connect database
   - listener
   - v.v...
*/

// =============================
// (Bạn giữ nguyên phần còn lại)
// =============================
