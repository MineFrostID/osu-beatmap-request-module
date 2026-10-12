const { v2 } = require("osu-api-extended");
const banchojs = require("bancho.js");
const {
  getClient,
  getUsers,
  isLoggedIn,
} = require("../services/banchoService");
const path = require("path");
const fs = require("fs");
const {
  historyRequest,
  successTemplate,
  notFoundTemplate,
} = require("../utils/templateHelper");
const { cInfo, cWarn, cError, cLog } = require("../utils/consoleHelper.js");

const MODS = new Set([
  "EZ",
  "NF",
  "HT",
  "HR",
  "SD",
  "PF",
  "DT",
  "NC",
  "HD",
  "FL",
  "RX",
  "AP",
  "SO",
  "V2",
]);

const sendRequest = async (input, username) => {
  try {
    if (!isLoggedIn()) {
      cWarn("BanchoJS not connected. Please login first.");
      return false;
    }

    const reqArr = input.split(" ");
    const beatmapId = parseInt(reqArr[0]);

    if (!Number.isInteger(beatmapId) || beatmapId <= 0) {
      cWarn("Invalid beatmap id:", beatmapId);
      return false;
    }

    // Mods check
    const foundMods = new Set();
    const regex = /\b(?:EZ|NF|HT|HR|SD|PF|DT|NC|HD|FL|RX|AP|SO|V2)+\b/g;
    const matches = input.toUpperCase().match(regex) || [];
    for (const match of matches) {
      let remaining = match;
      while (remaining.length > 0) {
        const mod = [...MODS]
          .sort((a, b) => b.length - a.length)
          .find((m) => remaining.startsWith(m));
        if (!mod) break;
        foundMods.add(mod);
        remaining = remaining.slice(mod.length);
      }
    }

    const CONFLICTING_MODS = [
      new Set(["DT", "NC", "HT"]),
      new Set(["HR", "EZ"]),
      new Set(["SD", "PF"]),
      new Set(["RX", "AP", "SO"]),
    ];
    for (const group of CONFLICTING_MODS) {
      const matchedMods = [...foundMods].filter((mod) => group.has(mod));
      for (const mod of matchedMods.slice(1)) {
        foundMods.delete(mod);
      }
    }

    let reqMods = foundMods.size > 0 ? [...foundMods].join("") : "NM";

    let data;
    try {
      data = await v2.beatmap.id.details(beatmapId);
    } catch (e) {
      cWarn("Error fetching beatmap:", e);
      return false;
    }

    if (!data || data.error) {
      const message = "Beatmap not found, please try another one.";
      notFoundTemplate(message);
      const response = {
        status: "success",
        message: message,
      };
      return response;
    }

    try {
      const mapUrl = `https://osu.ppy.sh/b/${data.id}`;
      const artist = data.beatmapset.artist || "Unknown Artist";
      const title = data.beatmapset.title || "Unknown Title";
      const mapper = data.beatmapset.creator || "Unknown Mapper";
      const detail = `${artist} - ${title}`;
      const respond = `${mapUrl} ${detail}`;
      const message = `[${respond}]`;
      const respondMessage = `Request send: [${reqMods}] ${artist} - ${title} (${mapUrl})`;

      const client = getClient();
      const users = getUsers();
      if (!client || !users) {
        cLog("BanchoJS client not ready.");
        return false;
      }

      const banchoMessage = new banchojs.OutgoingBanchoMessage(
        client,
        users,
        `${username} => [${reqMods}] ${message}`,
      );
      banchoMessage.send();

      successTemplate(username, detail, mapper, reqMods, mapUrl);

      historyRequest(username, detail, mapper, reqMods, mapUrl);

      const response = {
        status: "success",
        message: respondMessage,
        data: data,
      };

      return response;
    } catch (e) {
      cWarn("Failed to send message:", e?.message || e);
      return false;
    }
  } catch (error) {
    cWarn("Failed to send request:", error?.message || error);
  }
};

module.exports = { sendRequest };
