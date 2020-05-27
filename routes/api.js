var express = require("express");
var authRouter = require("./auth");
var roleRouter = require("./role");
var userRouter = require("./user");

var app = express();

app.use("/auth/", authRouter);
app.use("/role/", roleRouter);
app.use("/user/", userRouter);

module.exports = app;