// Lunar-Krystal main.js (đã sửa để dùng Secret File appstate.json từ Render)

const moment = require("moment-timezone");
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
const { join, resolve } = require("path");
const chalk = require("chalk");
const figlet = require("figlet");
const { execSync } = require("child_process");
const logger = require("./utils/log.js");
const os = require("os");
const login = require("./includes/login");
const axios = require("axios");
const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
const listbuiltinModules = require("module").builtinModules;
const connect = require("./utils/ConnectApi.js");

// ... các đoạn khai báo toàn cục giữ nguyên ...

//////////////////////////////////////////////////////////
//========= Find and get variable from Config =========//
/////////////////////////////////////////////////////////

var configValue;
try {
    global.client.configPath = join(global.client.mainPath, "config.json");
    configValue = require(global.client.configPath);
} catch {
    if (existsSync(global.client.configPath.replace(/\.json/g, "") + ".temp")) {
        configValue = readFileSync(global.client.configPath.replace(/\.json/g, "") + ".temp");
        configValue = JSON.parse(configValue);
        logger.loader(`Found: ${global.client.configPath.replace(/\.json/g, "") + ".temp"}`);
    }
}

try {
    for (const key in configValue) global.config[key] = configValue[key];
    connect.send();
} catch {
    return logger.loader("Can't load file config!", "error");
}

const { Sequelize, sequelize } = require("./includes/database");
writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

/////////////////////////////////////////
//========= Load language use =========//
/////////////////////////////////////////

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
};

///////////////////////////////////////
//========= Load appstate =========//
///////////////////////////////////////

try {
    const secretAppStatePath = "/etc/secrets/appstate.json"; // Secret File path from Render
    if (!existsSync(secretAppStatePath)) {
        return logger.loader("Không tìm thấy appstate.json trong Secret File", "error");
    }

    const raw = readFileSync(secretAppStatePath, "utf8");
    appState = JSON.parse(raw);

    const appStatePath = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
    writeFileSync(appStatePath, JSON.stringify(appState, null, 2), "utf8");

    logger.loader("✅ Đã đọc appstate từ Secret File và ghi ra appstate.json");
} catch (err) {
    return logger.loader(`❌ Lỗi khi đọc appstate từ Secret File: ${err.message}`);
}

//////////////////////////////////////////////
//========= Connecting to Database =========//
//////////////////////////////////////////////

(async () => {
    try {
        await sequelize.authenticate();
        const authentication = {};
        authentication.Sequelize = Sequelize;
        authentication.sequelize = sequelize;
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

process.on('unhandledRejection', (err, p) => { })
    .on('uncaughtException', err => {
        console.log(err);
    });
