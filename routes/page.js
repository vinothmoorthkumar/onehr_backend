var express = require("express");
const PageController = require("../controllers/PageController");

var router = express.Router();

router.get("/:slug", PageController.PageDetail);
router.put("/:slug", PageController.PageUpdate);
router.put("/extras/:slug", PageController.PageUpdateExtras);

module.exports = router;