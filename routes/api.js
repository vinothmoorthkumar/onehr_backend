var express = require("express");
var authRouter = require("./auth");
var roleRouter = require("./role");
var userRouter = require("./user");
var pageRouter = require("./page");
var mediaRouter = require("./media");

var app = express();

app.use("/auth/", authRouter);
app.use("/role/", roleRouter);
app.use("/user/", userRouter);
app.use("/page/", pageRouter);
app.use("/media/", mediaRouter);

module.exports = app;