var express = require("express");
const UserController = require("../controllers/UserController");

var router = express.Router();

router.get("/", UserController.UserList);
router.get("/:id", UserController.UserDetail);
router.post("/", UserController.UserSave);
router.put("/:id", UserController.UserUpdate);
router.delete("/:id", UserController.UserDelete);

module.exports = router;