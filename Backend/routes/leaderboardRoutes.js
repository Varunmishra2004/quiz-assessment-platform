const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authmiddleware");
const leaderboardController = require("../controller/leaderboardController");

router.get("/", authMiddleware, leaderboardController.getLeaderboard);

module.exports = router;