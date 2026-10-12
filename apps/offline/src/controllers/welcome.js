const path = require("path");
const fs = require("fs");
const { authorizeUser } = require("../services/osuAuthService.js");
const { connectBancho } = require("../services/banchoService.js");
const {
  loadSettings,
  isLogin,
  openBrowser,
} = require("../controllers/settings.js");
const config = require("../../config.json");
const { checkForUpdates } = require("../services/updateService.js");
const { cInfo, cWarn, cError, cLog } = require("../utils/consoleHelper.js");

const port = config.port || 3000;

const welcomeMessage = async () => {
  await checkForUpdates();
  cInfo("WELCOME TO OSU! REQUEST YOUTUBE BOT!");
  try {
    historyCheck();
    if (isLogin()) {
      const setting = loadSettings();

      await authorizeUser(setting.oauth_code.username);

      await connectBancho(setting.oauth_code.username, setting.legacy_api_key);
      openBrowser(port);
      return;
    }
  } catch (error) {
    cError("Error loading settings:", error);
  }

  cInfo("Please login to your osu! account");
  cInfo(`Open this link to login: http://localhost:${port}`);
  openBrowser(port);
};

const historyCheck = () => {
  const historyPath = path.join(process.cwd(), "history");
  if (!fs.existsSync(historyPath)) {
    fs.mkdirSync(historyPath);
  }
};

module.exports = { welcomeMessage, historyCheck };
