const log = (type, message) => {
  console.log(`[${type}]`.padEnd(12) + message);
};

const cInfo = (message) => log("INFO", message);
const cWarn = (message) => log("WARN", message);
const cError = (message) => log("ERROR", message);
const cLog = (message) => log("LOG", message);
const cUpdate = (message) => log("UPDATE", message);
const cSuccess = (message) => log("SUCCESS", message);

module.exports = { cInfo, cWarn, cError, cLog, cUpdate, cSuccess };
