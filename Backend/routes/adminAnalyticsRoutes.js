const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authmiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");
const adminAnalyticsController = require("../controller/adminAnalyticsController");

router.get("/analytics", authMiddleware, adminMiddleware, adminAnalyticsController.getAdminAnalytics);
router.get("/", authMiddleware, adminMiddleware, adminAnalyticsController.getAdminAnalytics);

module.exports = router;