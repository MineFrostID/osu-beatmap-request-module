const fs = require("fs");
const path = require("path");

const settingsPath = path.resolve(process.cwd(), "./setting.json");

function loadSettings() {
  if (fs.existsSync(settingsPath)) {
    return JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  }
  return {};
}

function saveSettings(data) {
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), "utf8");
}

module.exports = { loadSettings, saveSettings };
