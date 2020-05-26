var express = require("express");
const RoleController = require("../controllers/RoleController");

var router = express.Router();

router.get("/", RoleController.RoleList);
router.get("/:id", RoleController.RoleDetail);
router.post("/", RoleController.RoleSave);
router.put("/:id", RoleController.RoleUpdate);
router.delete("/:id", RoleController.RoleDelete);

module.exports = router;