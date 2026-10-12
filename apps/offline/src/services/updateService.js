const packageJson = require("../../package.json");
const { cInfo, cWarn, cError, cLog } = require("../utils/consoleHelper.js");

const CURRENT_VERSION = packageJson.version;
const GITHUB_REPO = "MineFrostID/osu-beatmap-request-module";

async function checkForUpdates() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const release = await response.json();

    const latestVersion = release.tag_name.replace(/^v/, "");

    if (compareVersions(latestVersion, CURRENT_VERSION) > 0) {
      cLog("\n[UPDATE] A new version is available!");
      cLog(`Current version: ${CURRENT_VERSION}`);
      cLog(`Latest version:  ${latestVersion}`);
      cLog(`Release: ${release.html_url}\n`);

      return {
        updateAvailable: true,
        currentVersion: CURRENT_VERSION,
        latestVersion,
        releaseUrl: release.html_url,
      };
    }

    cLog(`[UPDATE] You're using the latest version (${CURRENT_VERSION}).`);

    return {
      updateAvailable: false,
      currentVersion: CURRENT_VERSION,
      latestVersion,
    };
  } catch (error) {
    cWarn(`[UPDATE] Could not check for updates: ${error.message}`);

    return {
      updateAvailable: false,
      error: error.message,
    };
  }
}

function compareVersions(a, b) {
  const parse = (version) => version.split(".").map((part) => Number(part));

  const versionA = parse(a);
  const versionB = parse(b);

  for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
    const numA = versionA[i] ?? 0;
    const numB = versionB[i] ?? 0;

    if (!Number.isFinite(numA) || !Number.isFinite(numB)) {
      throw new Error("Invalid version format");
    }

    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }

  return 0;
}

module.exports = { checkForUpdates };
