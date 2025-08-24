const { auth } = require("osu-api-extended");
const config = require("../config/config.json");

const settings = require("../controllers/settings");

let userInfo = null;

const buildLoginUrl = () => {
  return auth.build_url(
    config.oauth.CLIENT_ID,
    config.oauth.REDIRECT_URI,
    config.oauth.SCOPE_LIST
  );
};

const redirectUser = async (code) => {
  if (!code) throw new Error("Missing authorization code");

  userInfo = await auth.authorize(
    code,
    "osu",
    config.oauth.CLIENT_ID,
    config.oauth.CLIENT_SECRET,
    config.oauth.REDIRECT_URI
  );

  if (userInfo?.authentication === "basic") {
    throw new Error(
      "Failed to authorize with osu! (check CLIENT_ID/SECRET/REDIRECT_URI)"
    );
  }

  await authorizeUser(userInfo.username);

  return userInfo;
};

const authorizeUser = async (username) => {
  const setting = settings.loadSettings();

  if (setting.oauth_code) {
    await auth.login(
      config.oauth.CLIENT_ID,
      config.oauth.CLIENT_SECRET,
      config.oauth.SCOPE_LIST,
      setting.oauth_code.access_token
    );
  } else {
    const data = await auth.login(
      config.oauth.CLIENT_ID,
      config.oauth.CLIENT_SECRET,
      config.oauth.SCOPE_LIST
    );

    data.username = username;
    setting.oauth_code = data;
    settings.saveSettings(setting);
  }

  console.log("osu! API Extended Logged in!");
};

const getUserInfo = () => userInfo;

module.exports = {
  buildLoginUrl,
  redirectUser,
  authorizeUser,
  getUserInfo,
};
