const express = require("express");
const indexRouter = require("./src/routes/index");
const { welcomeMessage } = require("./src/controllers/welcome");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

welcomeMessage();
app.use("/", indexRouter);

module.exports = app;
