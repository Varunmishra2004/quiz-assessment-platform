const express = require("express");
const db = require("../config/database.js");
const { verifyToken } = require("../middleware/auth.js");

const router = express.Router();

router.get("/:quizId", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM questions WHERE quiz_id = $1", [req.params.quizId]);
    const questions = await Promise.all(
      result.rows.map(async (question) => {
        const optionResult = await db.query("SELECT * FROM options WHERE question_id = $1", [question.id]);
        return { ...question, options: optionResult.rows || [] };
      })
    );

    res.json({ success: true, data: questions });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Database error" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Only admins can create questions" });
  }

  try {
    const { quiz_id, question_text, marks, options } = req.body;
    const result = await db.query(
      "INSERT INTO questions (quiz_id, question_text, marks) VALUES ($1, $2, $3) RETURNING id",
      [quiz_id, question_text, marks]
    );
    const questionId = result.rows[0].id;

    for (const option of options || []) {
      await db.query("INSERT INTO options (question_id, text, is_correct) VALUES ($1, $2, $3)", [questionId, option.text, option.is_correct]);
    }

    res.status(201).json({ success: true, message: "Question created", data: { id: questionId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create question" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Only admins can delete questions" });
  }

  try {
    await db.query("DELETE FROM questions WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: "Question deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete question" });
  }
});

module.exports = router;