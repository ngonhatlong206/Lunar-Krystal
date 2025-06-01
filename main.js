// ✅ main.js hoàn chỉnh — sử dụng Secret File (Render) thay vì endpoint API

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

// Khởi tạo các đối tượng global

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
        switch (option) {
            case "seconds": return `${moment.tz("Asia/Ho_Chi_minh").format("ss")}`;
            case "minutes": return `${moment.tz("Asia/Ho_Chi_minh").format("mm")}`;
            case "hours": return `${moment.tz("Asia/Ho_Chi_minh").format("HH")}`;
            case "date": return `${moment.tz("Asia/Ho_Chi_minh").format("DD")}`;
            case "month": return `${moment.tz("Asia/Ho_Chi_minh").format("MM")}`;
            case "year": return `${moment.tz("Asia/Ho_Chi_minh").format("YYYY")}`;
            case "fullHour": return `${moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss")}`;
            case "fullYear": return `${moment.tz("Asia/Ho_Chi_minh").format("DD/MM/YYYY")}`;
            case "fullTime": return `${moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss DD/MM/YYYY")}`;
        }
    }
});

// Tạo global cho dữ liệu

global.data = new Object({
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    threadAllowNSFW: new Array(),
    allUserID: new Array(),
    allCurrenciesID: new Array(),
    allThreadID: new Array()
});

global.utils = require("./utils");
global.nodemodule = new Object();
global.config = new Object();
global.configModule = new Object();
global.moduleData = new Array();
global.language = new Object();

// Đọc file config.json
var configValue;
try {
    global.client.configPath = join(global.client.mainPath, "config.json");
    configValue = require(global.client.configPath);
} catch {
    if (existsSync(global.client.configPath.replace(/\.json/g,"") + ".temp")) {
        configValue = readFileSync(global.client.configPath.replace(/\.json/g,"") + ".temp");
        configValue = JSON.parse(configValue);
        logger.loader(`Found: ${global.client.configPath.replace(/\.json/g,"") + ".temp"}`);
    }
}

try {
    for (const key in configValue) global.config[key] = configValue[key];
    connect.send()
} catch {
    return logger.loader("Can't load file config!", "error")
}

// Lưu file config tạm
const { Sequelize, sequelize } = require("./includes/database");
writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

// Load ngôn ngữ
const langFile = (readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);
const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');
for (const item of langData) {
    const getSeparator = item.indexOf('=');
    const itemKey = item.slice(0, getSeparator);
    const itemValue = item.slice(getSeparator + 1, item.length);
    const head = itemKey.slice(0, itemKey.indexOf('.'));
    const key = itemKey.replace(head + '.', '');
    const value = itemValue.replace(/\\n/gi, '\n');
    if (typeof global.language[head] == "undefined") global.language[head] = new Object();
    global.language[head][key] = value;
}

global.getText = function (...args) {
    const langText = global.language;
    if (!langText.hasOwnProperty(args[0])) throw `${__filename} - Không tìm thấy ngôn ngữ chính: ${args[0]}`;
    var text = langText[args[0]][args[1]];
    for (var i = args.length - 1; i > 0; i--) {
        const regEx = RegExp(`%${i}`, 'g');
        text = text.replace(regEx, args[i + 1]);
    }
    return text;
}

// ✅ Đọc AppState từ SECRET FILE
try {
    const secretAppStatePath = "/etc/secrets/appstate.json";
    if (!existsSync(secretAppStatePath)) {
        return logger.loader("Không tìm thấy appstate.json trong Secret File", "error");
    }
    const raw = readFileSync(secretAppStatePath, "utf8");
    global.appState = JSON.parse(raw);
    const appStatePath = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
    writeFileSync(appStatePath, JSON.stringify(global.appState, null, 2), "utf8");
    logger.loader("✅ Đã đọc appstate từ Secret File và ghi ra appstate.json");
} catch (err) {
    return logger.loader(`❌ Lỗi khi đọc appstate từ Secret File: ${err.message}`);
}

//////////////////////////////////////////////
//========= Kết nối Database & chạy bot ===//
//////////////////////////////////////////////
(async () => {
    try {
        await sequelize.authenticate();
        const authentication = { Sequelize, sequelize };
        const models = require('./includes/database/model')(authentication);
        logger(global.getText('mirai', 'successConnectDatabase'), '[ DATABASE ] ');

        const botData = {};
        botData.models = models;
        const onBot = require("./onBot");
        onBot(botData);
    } catch (error) {
        logger(global.getText('mirai', 'successConnectDatabase', JSON.stringify(error)), '[ DATABASE ] ');
    }
})();

process.on('unhandledRejection', (err, p) => {})
    .on('uncaughtException', err => { console.log(err); });
