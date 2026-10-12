const cInfo = (message) => {
  console.info(`[INFO] ${message}`);
};

const cWarn = (message) => {
  console.warn(`[WARN] ${message}`);
};

const cError = (message) => {
  console.error(`[ERROR] ${message}`);
};

const cLog = (message) => {
  console.log(`[LOG] ${message}`);
};

module.exports = { cInfo, cWarn, cError, cLog };
