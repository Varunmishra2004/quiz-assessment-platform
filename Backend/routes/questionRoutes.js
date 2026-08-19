const express = require("express");
const router = express.Router();

const {
    createQuestion,
    getQuizQuestions,
    updateQuestion,
    deleteQuestion
} = require("../controller/questionController");

const authMiddleware = require("../middleware/authmiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");


// GET QUESTIONS FOR A QUIZ
router.get(
    "/quiz/:quizId",
    authMiddleware,
    adminMiddleware,
    getQuizQuestions
);


// CREATE QUESTION FOR A QUIZ
router.post(
    "/quiz/:quizId",
    authMiddleware,
    adminMiddleware,
    createQuestion
);


// UPDATE QUESTION
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateQuestion
);


// DELETE QUESTION
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteQuestion
);


module.exports = router;