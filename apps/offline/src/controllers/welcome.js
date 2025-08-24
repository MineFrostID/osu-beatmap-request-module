const port = require("../config/config.json").server.port;
const fs = require("fs");
const path = require("path");
const osuAuthService = require("../services/osuAuthService");
const banchoService = require("../services/banchoService");

// Welcome Message
const welcomeMessage = async () => {
  console.info("WELCOME TO OSU! REQUEST YOUTUBE BOT!");

  if (settingCheck()) {
    try {
      const settingPath = path.join(process.cwd(), "../setting.json");
      let setting = {};

      const rawData = fs.readFileSync(settingPath, "utf8");
      setting = JSON.parse(rawData);

      if (setting.oauth_code && setting.legacy_api_key) {
        await osuAuthService.authorizeUser(setting.oauth_code.username);
        await banchoService.connectBancho(
          setting.oauth_code.username,
          setting.legacy_api_key
        );

        return console.info("Logged in successfully!");
      }
    } catch (error) {
      console.error("Error reading your setting");
      console.error(error.message);
    }
  }
  console.info("Please login to your osu! account");
  console.info("Open this link to login:");
  console.info("http://localhost:" + port + "/login");
};

const settingCheck = () => {
  const settingPath = path.join(process.cwd(), "../setting.json");
  let status = true;
  if (!fs.existsSync(settingPath)) {
    fs.writeFileSync(settingPath, "{}", "utf8");
    status = false;
  }

  const logsPath = path.join(process.cwd(), "../logs");
  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath);
    status = false;
  }
  return status;
};

module.exports = { welcomeMessage, settingCheck };
