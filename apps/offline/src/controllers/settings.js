const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { cInfo, cError, cLog, cWarn } = require("../utils/consoleHelper.js");

const settingsPath = path.join(path.dirname(process.execPath), "setting.json");

function ensureSettingsFile() {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, "{}", "utf8");
  }
}

function loadSettings() {
  ensureSettingsFile();

  try {
    const raw = fs.readFileSync(settingsPath, "utf8");
    return JSON.parse(raw || "{}");
  } catch (error) {
    cWarn("Setting file corrupted. Resetting...");
    resetSettings();
    return {};
  }
}

function saveSettings(data) {
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), "utf8");
}

function resetSettings() {
  saveSettings({});
}

function isLogin() {
  const setting = loadSettings();

  const hasOauth = !!setting.oauth_code;
  const hasLegacy = !!setting.legacy_api_key;

  if (hasOauth && hasLegacy) {
    return true;
  }

  if (hasOauth || hasLegacy) {
    cWarn("Partial login detected. Resetting settings...");
    resetSettings();
  }

  return false;
}

function webCheck() {
  const setting = loadSettings();

  if (setting.oauth_code && setting.legacy_api_key) return 0;
  if (setting.oauth_code) return 1;
  return 2;
}

const openBrowser = async (port) => {
  try {
    const url = `http://localhost:${port}`;
    if (process.platform === "win32") {
      exec(`start ${url}`);
    } else if (process.platform === "darwin") {
      exec(`open ${url}`);
    } else {
      exec(`xdg-open ${url}`);
    }
  } catch (error) {
    cError("Error opening browser:", error);
  }
};

module.exports = {
  loadSettings,
  saveSettings,
  resetSettings,
  isLogin,
  webCheck,
  openBrowser,
};
