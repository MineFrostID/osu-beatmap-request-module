const banchojs = require("bancho.js");
const readline = require("readline");
const settings = require("../controllers/settings");

let client = null;
let users = null;
let loginStatus = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getAPICode() {
  console.log("=====================================");
  console.log(
    "Get your token at https://osu.ppy.sh/home/account/edit#legacy-api"
  );
  return new Promise((resolve) =>
    rl.question("Enter your osu! API V1 token: ", (answer) =>
      resolve(answer?.trim())
    )
  );
}

const connectBancho = async (username, token) => {
  client = new banchojs.BanchoClient({
    username: username,
    password: token,
  });

  client.on("disconnect", () => {
    console.log("BANCHOJS DISCONNECTED!");
    loginStatus = false;
  });

  await client.connect();
  users = client.getSelf();

  console.log("BANCHOJS CONNECTED!");
  rl.close();
  loginStatus = true;

  const setting = settings.loadSettings();
  setting.legacy_api_key = token;
  settings.saveSettings(setting);

  return { client, users };
};

const loginBanchoJs = async (username) => {
  if (loginStatus && client) return { client, users };

  let TOKEN_V1 = null;
  let loginSuccess = false;

  for (let i = 0; i < 3 && !loginSuccess; i++) {
    TOKEN_V1 = await getAPICode();
    if (!TOKEN_V1) {
      console.log("API V1 token cannot be empty. Please try again.");
      i--;
      continue;
    }
    try {
      await connectBancho(username, TOKEN_V1);
      loginSuccess = true;
    } catch (e) {
      console.log("Failed to connect BanchoJS. Error: ", e);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!loginSuccess) {
    console.log(
      "Failed to connect BanchoJS after 3 attempts. Stopping server..."
    );
    process.exit(1);
  }

  return { client, users };
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
