var express = require("express");
var authRouter = require("./auth");
var roleRouter = require("./role");

var app = express();

app.use("/auth/", authRouter);
app.use("/role/", roleRouter);

module.exports = app;