const express = require("express");
const indexRouter = require("./src/routes/index");
const app = express();
// const logger = require("morgan");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(logger("common"));

app.use("/", indexRouter);

module.exports = app;
