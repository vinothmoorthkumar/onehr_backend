var express = require("express");
var authRouter = require("./auth");
var roleRouter = require("./role");
var userRouter = require("./user");
var pageRouter = require("./page");

var app = express();

app.use("/auth/", authRouter);
app.use("/role/", roleRouter);
app.use("/user/", userRouter);
app.use("/page/", pageRouter);

module.exports = app;