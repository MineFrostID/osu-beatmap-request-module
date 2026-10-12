const banchojs = require("bancho.js");
const readline = require("readline");
const { saveSettings, loadSettings } = require("../controllers/settings");
const {
  cInfo,
  cWarn,
  cError,
  cLog,
  cSuccess,
} = require("../utils/consoleHelper.js");

let client = null;
let users = null;
let loginStatus = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const handleError = (error, context = "") => {
  const fatalErrors = [
    "ENOTFOUND",
    "ECONNREFUSED",
    "TypeError",
    "ReferenceError",
  ];
  if (
    fatalErrors.some((f) => error.message.includes(f) || error.name.includes(f))
  ) {
    cError(`Fatal error in ${context}:`, error);
  } else {
    cWarn(
      `Oops, something went wrong in ${context}. Please check your input and try again.`,
    );
  }
};

const connectBancho = async (username, token) => {
  try {
    client = new banchojs.BanchoClient({
      username: username,
      password: token,
    });

    client.on("disconnect", () => {
      cWarn("BANCHOJS DISCONNECTED!");
      loginStatus = false;
    });

    await client.connect();
    users = client.getSelf();

    cSuccess("bancho.js Connected!");
    rl.close();
    loginStatus = true;

    const setting = loadSettings();
    setting.legacy_api_key = token;
    saveSettings(setting);

    return { client, users };
  } catch (error) {
    handleError(error, "connectBancho");
    return null;
  }
};

const loginBanchoJs = async (username, api) => {
  try {
    if (loginStatus && client) return { client, users };

    if (!api) {
      cWarn("API V1 token cannot be empty. Please try again.");
      return null;
    }

    const connection = await connectBancho(username, api);
    if (!connection) {
      cWarn(
        "Failed to connect BanchoJS. Please make sure your username and token are correct.",
      );
      return null;
    }

    return connection;
  } catch (error) {
    handleError(error, "loginBanchoJs");
    return null;
  }
};

const isLoggedIn = () => Boolean(loginStatus && client);
const getClient = () => client;
const getUsers = () => users;

module.exports = {
  connectBancho,
  loginBanchoJs,
  isLoggedIn,
  getClient,
  getUsers,
};
