const express = require("express");
const router = express.Router();

const { getAllStudents } = require("../controller/userController");

const authMiddleware = require("../middleware/authmiddleware");

const {
    adminMiddleware
} = require("../middleware/roleMiddleware");


router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllStudents
);

module.exports = router;