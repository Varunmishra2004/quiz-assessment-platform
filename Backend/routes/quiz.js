const express = require("express");
const db = require("../config/database.js");
const { verifyToken } = require("../middleware/auth.js");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM quizzes WHERE status = 'PUBLISHED'");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Database error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM quizzes WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Database error" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Only admins can create quizzes" });
  }

  try {
    const { title, description, duration_minutes, passing_score, category_id } = req.body;
    const result = await db.query(
      "INSERT INTO quizzes (title, description, duration_minutes, passing_score, category_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [title, description, duration_minutes, passing_score, category_id, "DRAFT"]
    );

    res.status(201).json({ success: true, message: "Quiz created", data: { id: result.rows[0].id } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create quiz" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Only admins can delete quizzes" });
  }

  try {
    await db.query("DELETE FROM quizzes WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: "Quiz deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete quiz" });
  }
});

router.put("/:id/publish", verifyToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Only admins can publish quizzes" });
  }

  try {
    await db.query("UPDATE quizzes SET status = $1 WHERE id = $2", ["PUBLISHED", req.params.id]);
    res.json({ success: true, message: "Quiz published" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to publish quiz" });
  }
});

module.exports = router;