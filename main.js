// ✅ main.js hoàn chỉnh – sử dụng Secret File thay vì gọi endpoint API ngoài

const moment = require("moment-timezone");
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
const { join, resolve } = require("path");
const chalk = require('chalk');
const figlet = require('figlet');
const { execSync } = require('child_process');
const logger = require("./utils/log.js");
const os = require('os');
const login = require("./includes/login");
const axios = require("axios");
const connect = require("./utils/ConnectApi.js");

// ====== Global client ======
global.client = {
  commands: new Map(),
  events: new Map(),
  cooldowns: new Map(),
  eventRegistered: [],
  handleSchedule: [],
  handleReaction: [],
  handleReply: [],
  mainPath: process.cwd(),
  configPath: "",
  getTime(option) {
    const time = moment.tz("Asia/Ho_Chi_Minh");
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
};

// ====== Global data ======
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

// ====== Load config.json ======
let configValue;
try {
  global.client.configPath = join(global.client.mainPath, "config.json");
  configValue = require(global.client.configPath);
} catch {
  const fallback = global.client.configPath.replace(/\.json$/, '') + ".temp";
  if (existsSync(fallback)) {
    configValue = JSON.parse(readFileSync(fallback));
    logger.loader(`Found: ${fallback}`);
  }
}

try {
  for (const key in configValue) global.config[key] = configValue[key];
  connect.send();
} catch {
  return logger.loader("Can't load file config!", "error");
}

// ====== Save config temp ======
const { Sequelize, sequelize } = require("./includes/database");
writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

// ====== Load language ======
const langFile = readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, 'utf8').split(/\r?\n|\r/);
const langData = langFile.filter(line => line && !line.startsWith("#"));
for (const line of langData) {
  const [keyRaw, ...valueParts] = line.split("=");
  const head = keyRaw.split(".")[0];
  const key = keyRaw.slice(head.length + 1);
  const value = valueParts.join("=").replace(/\\n/g, "\n");
  global.language[head] = global.language[head] || {};
  global.language[head][key] = value;
}

global.getText = function (...args) {
  const [section, key, ...params] = args;
  let text = global.language?.[section]?.[key] || '';
  params.forEach((val, i) => text = text.replace(new RegExp(`%${i + 1}`, 'g'), val));
  return text;
};

// ====== Đọc AppState từ SECRET FILE (/etc/secrets/appstate.json) ======
try {
  const secretAppStatePath = "/etc/secrets/appstate.json";
  if (!existsSync(secretAppStatePath)) return logger.loader("Không tìm thấy appstate.json trong Secret File", "error");

  const raw = readFileSync(secretAppStatePath, "utf8");
  global.appState = JSON.parse(raw);

  const appStatePath = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
  writeFileSync(appStatePath, JSON.stringify(global.appState, null, 2), "utf8");
  logger.loader("✅ Đã đọc appstate từ Secret File và ghi ra appstate.json");
} catch (err) {
  return logger.loader(`❌ Lỗi khi đọc appstate từ Secret File: ${err.message}`, "error");
}

// ====== Kết nối database và chạy bot ======
(async () => {
  try {
    await sequelize.authenticate();
    const authentication = { Sequelize, sequelize };
    const models = require('./includes/database/model')(authentication);
    logger(global.getText('mirai', 'successConnectDatabase'), '[ DATABASE ]');

    const botData = { models };
    const onBot = require("./onBot");
    onBot(botData);
  } catch (err) {
    logger(global.getText('mirai', 'successConnectDatabase', JSON.stringify(err)), '[ DATABASE ]');
  }
})();

process.on('unhandledRejection', (err) => {})
  .on('uncaughtException', (err) => console.log(err));
