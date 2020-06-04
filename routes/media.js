var express = require("express");
const MediaController = require("../controllers/MediaController");

var router = express.Router();

router.get("/", MediaController.MediaList);
router.get("/:id", MediaController.MediaDetail);
router.post("/", MediaController.MediaSave);
router.post("/update/:id", MediaController.MediaUpdate);
router.delete("/:id", MediaController.MediaDelete);

module.exports = router;