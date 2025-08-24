const express = require("express");
const router = express.Router();
const osuAuthService = require("../services/osuAuthService");
const banchoService = require("../services/banchoService");
const requestService = require("../services/requestService");

router.get("/", (req, res) => {
  if (banchoService.isLoggedIn()) {
    res.send("Welcome to osu! Request Youtube Bot!");
  } else {
    res.send("Welcome! Please login at /login");
  }
});

router.get("/login", async (req, res) => {
  if (banchoService.isLoggedIn()) {
    res.send("Already logged in!");
    return;
  }
  res.redirect(osuAuthService.buildLoginUrl());
});

router.get("/callback", async (req, res) => {
  if (banchoService.isLoggedIn()) {
    res.send("Already logged in!");
    return;
  }
  const userInfo = await osuAuthService.redirectUser(req.query.code);
  res.send(
    `Logged in as ${userInfo.username}. Get your token at https://osu.ppy.sh/home/account/edit#legacy-api and continue to input your API V1 Token!`
  );
  await banchoService.loginBanchoJs(userInfo.username);
});

router.get("/request/:id", async (req, res) => {
  if (!banchoService.isLoggedIn()) {
    res.send("Please login first!");
    return;
  }
  const message = await requestService.sendRequest(req.params.id, "Anonymous");
  if (!message) res.send("Beatmap not found, try another one!");
  else res.send(message);
});

router.get("/request/:id/:name", async (req, res) => {
  if (!banchoService.isLoggedIn()) {
    res.send("Please login first!");
    return;
  }
  const message = await requestService.sendRequest(
    req.params.id,
    req.params.name
  );
  if (!message) res.send("Beatmap not found, try another one!");
  else res.send(message);
});

module.exports = router;
