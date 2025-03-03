const express = require("express");

const router = express.Router();
const progressController = require("../controllers/progressController");

router.post("/video-watched", progressController.markVideoAsWatched);
router.post("/assignment-completed", progressController.markAssignmentAsCompleted);
router.post("/check-topic", progressController.checkTopicCompletion);

module.exports = router;
