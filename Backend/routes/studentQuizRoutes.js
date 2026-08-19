const express = require("express");
const router = express.Router();

const {
    getPublishedQuizzes,
    getQuizDetails,
    startQuiz,
    submitQuiz,
    getAttemptResult,
    getAttemptHistory,
    getStudentDashboard
} = require("../controller/studentQuizController");

const authMiddleware = require("../middleware/authmiddleware");
const { studentMiddleware } = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, studentMiddleware, getPublishedQuizzes);

router.get("/:quizId", authMiddleware, studentMiddleware, getQuizDetails);

router.post("/:quizId/start", authMiddleware, studentMiddleware, startQuiz);

router.post("/:quizId/submit", authMiddleware, studentMiddleware, submitQuiz);

router.get("/attempts/:attemptId", authMiddleware, studentMiddleware, getAttemptResult);

router.get("/attempts", authMiddleware, studentMiddleware, getAttemptHistory);

router.get("/dashboard/stats", authMiddleware, studentMiddleware, getStudentDashboard);

module.exports = router;