const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authmiddleware");
const dashboardController = require("../controller/dashboardController");

router.get("/student", authMiddleware, dashboardController.getStudentDashboard);

module.exports = router;