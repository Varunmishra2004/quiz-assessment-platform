const express = require("express");
const router = express.Router();

const {
    createQuiz,
    getAllQuizzes,
    updateQuiz,
    deleteQuiz,
    updateQuizStatus
} = require("../controller/quizController");

const authMiddleware = require("../middleware/authmiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, adminMiddleware, getAllQuizzes);

router.post("/", authMiddleware, adminMiddleware, createQuiz);

router.put("/:id", authMiddleware, adminMiddleware, updateQuiz);

router.delete("/:id", authMiddleware, adminMiddleware, deleteQuiz);

router.patch(
    "/:id/status",
    authMiddleware,
    adminMiddleware,
    updateQuizStatus
);

module.exports = router;