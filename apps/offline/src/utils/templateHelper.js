const fs = require("fs");
const path = require("path");

const loadTemplate = (fileName) => {
  let templatePath;
  if (process.pkg) {
    templatePath = path.join(__dirname, "..", "views", fileName);
  } else {
    templatePath = path.join(process.cwd(), "src", "views", fileName);
  }
  return fs.readFileSync(templatePath, "utf8");
};

const historyRequest = (username, detail, mapper, reqMods, mapUrl) => {
  const now = new Date();

  const date = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  const time = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

  const logsPath = path.join(process.cwd(), "./history");
  const filename = `${date}.txt`;
  const filePath = path.join(logsPath, filename);

  const logContent = `=====================================\n[${date} ${time}]\nREQUEST BY: ${username}\nDETAIL: ${detail}\nMAPPER: ${mapper}\nMODS: ${reqMods}\nLINK: ${mapUrl}\n=====================================\n\n`;

  fs.appendFileSync(filePath, logContent, "utf8");
};

const successTemplate = (username, detail, mapper, reqMods, mapUrl) => {
  console.log("=====================================");
  console.log("REQUEST BY :", username);
  console.log("DETAIL     :", detail);
  console.log("MAPPER     :", mapper);
  console.log("MODS       :", reqMods);
  console.log("LINK       :", mapUrl);
  console.log("=====================================");
};

const notFoundTemplate = (message) => {
  console.log("=====================================");
  console.log(message || "Beatmap not found or API returned error.");
  console.log("=====================================");
};

module.exports = {
  loadTemplate,
  historyRequest,
  successTemplate,
  notFoundTemplate,
};
