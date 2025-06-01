// ✅ main.js — đã fix lỗi global.client undefined + thêm debug login rõ ràng

const moment = require("moment-timezone");
const { readdirSync, readFileSync, writeFileSync, existsSync } = require("fs-extra");
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

// ✅ Đặt global.client lên đầu để tránh lỗi undefined
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

// ========== Load config ==========
let configValue;
try {
  global.client.configPath = join(global.client.mainPath, "config.json");
  configValue = require(global.client.configPath);
} catch {
  const fallback = global.client.configPath.replace(/\.json$/, "") + ".temp";
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

const { Sequelize, sequelize } = require("./includes/database");
writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), "utf8");

// ========== Load language ==========
global.language = {};
const langFile = readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, "utf8").split(/\r?\n|\r/);
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

// ========== Đọc appstate từ Secret File ==========
let appState;
try {
  const secretAppStatePath = "/etc/secrets/appstate.json";
  if (!existsSync(secretAppStatePath)) throw new Error("Không tìm thấy Secret File");
  const raw = readFileSync(secretAppStatePath, "utf8");
  appState = JSON.parse(raw);
  const localPath = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
  writeFileSync(localPath, JSON.stringify(appState, null, 2), "utf8");
  logger.loader("✅ Đã đọc appstate từ Secret File và ghi ra appstate.json");
} catch (e) {
  return logger.loader(global.getText("mirai", "notFoundPathAppstate") + ` (${e.message})`, "error");
}

// ========== Kết nối DB và chạy bot ==========
(async () => {
  try {
    await sequelize.authenticate();
    const authentication = { Sequelize, sequelize };
    const models = require("./includes/database/model")(authentication);
    logger(global.getText("mirai", "successConnectDatabase"), "[ DATABASE ]");

    console.log("🚀 Đã kết nối DB, bắt đầu đăng nhập Facebook...");
    console.log("📂 Appstate:", JSON.stringify(appState));

    login({ appState }, (err, api) => {
      if (err) {
        console.log("❌ Login thất bại:", JSON.stringify(err));
        return logger("❌ Đăng nhập thất bại: " + (err.error || err), "LOGIN");
      }

      console.log("✅ Login thành công, đang khởi động bot...");

      api.setOptions(global.config.FCAOption || {});
      global.client.api = api;

      try {
        const listener = require("./includes/listen")({ api, models });
        console.log("📡 Bắt đầu lắng nghe sự kiện tin nhắn...");

        global.handleListen = api.listenMqtt((err, event) => {
          if (err) {
            console.log("❌ Lỗi khi lắng nghe:", err);
            return logger("Lỗi khi lắng nghe tin nhắn: " + JSON.stringify(err), "LISTEN");
          }
          listener(event);
        });
      } catch (e) {
        console.log("❌ Lỗi khi load listener:", e);
      }
    });
  } catch (err) {
    logger(global.getText("mirai", "successConnectDatabase", JSON.stringify(err)), "[ DATABASE ]");
  }
})();

process.on("unhandledRejection", () => {})
  .on("uncaughtException", err => console.log(err));
