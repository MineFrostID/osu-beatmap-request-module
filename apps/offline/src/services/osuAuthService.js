const { auth } = require("osu-api-extended");
const { loadSettings, saveSettings } = require("../controllers/settings");
const config = require("../../config.json");
const {
  cWarn,
  cError,
  cSuccess,
} = require("../utils/consoleHelper.js");

const client_id = config.clientId;
const client_secret = config.clientSecret;
const redirect_uri = config.redirectUri;
const scope_list = config.scopeList;

let userInfo = null;

const buildLoginUrl = () => {
  return auth.build_url(client_id, redirect_uri, scope_list);
};

const redirectUser = async (code) => {
  if (!code) {
    cWarn("Authorization code is missing. Please login first.");
    return null;
  }

  try {
    userInfo = await auth.authorize(
      code,
      "osu",
      client_id,
      client_secret,
      redirect_uri,
    );

    if (userInfo?.authentication === "basic") {
      cWarn(
        "Failed to authorize. Please check your CLIENT_ID, CLIENT_SECRET, or REDIRECT_URI.",
      );
      return null;
    }

    const authorized = await authorizeUser(userInfo.username);
    if (!authorized) {
      cWarn("Failed to authorize user. Please check your credentials.");
      return null;
    }
    return userInfo;
  } catch (error) {
    handleError(error, "redirectUser");
    return null;
  }
};

const authorizeUser = async (username) => {
  try {
    const setting = loadSettings();

    if (setting.oauth_code) {
      await auth.login(
        client_id,
        client_secret,
        scope_list,
        setting.oauth_code.access_token,
      );
    } else {
      const data = await auth.login(client_id, client_secret, scope_list);
      data.username = username;
      setting.oauth_code = data;
      saveSettings(setting);
    }

    cSuccess("osu-api-extended connected successfully!");
    return true;
  } catch (error) {
    handleError(error, "authorizeUser");
    return false;
  }
};

const getUserInfo = () => userInfo;

const handleError = (error, context = "") => {
  const fatalErrors = [
    "ENOTFOUND",
    "ECONNREFUSED",
    "TypeError",
    "ReferenceError",
  ];

  const message = error?.message || String(error);
  const name = error?.name || "";
  if (fatalErrors.some((f) => message.includes(f) || name.includes(f))) {
    cError(`Fatal error in ${context}:`, error);
  } else {
    cWarn(`Oops, something went wrong in ${context}. Please try again.`);
  }
};

module.exports = { buildLoginUrl, redirectUser, authorizeUser, getUserInfo };
