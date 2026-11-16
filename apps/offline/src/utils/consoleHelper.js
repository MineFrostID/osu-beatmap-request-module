const log = (type, ...messages) => {
  console.log(`[${type}]`.padEnd(12), ...messages);
};

const cInfo = (...message) => log("INFO", ...message);
const cWarn = (...message) => log("WARN", ...message);
const cError = (...message) => log("ERROR", ...message);
const cLog = (...message) => log("LOG", ...message);
const cUpdate = (...message) => log("UPDATE", ...message);
const cSuccess = (...message) => log("SUCCESS", ...message);

module.exports = { cInfo, cWarn, cError, cLog, cUpdate, cSuccess };
