const express = require("express");
const db = require("../config/database.js");
const { verifyToken } = require("../middleware/auth.js");

const router = express.Router();

router.get("/student", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const statsQuery = `
      SELECT
        COUNT(*)::int AS quizzes_attempted,
        COALESCE(AVG(percentage), 0)::float AS average_percentage
      FROM attempts
      WHERE user_id = $1
    `;

    const statsResult = await db.query(statsQuery, [userId]);

    const attemptsQuery = `
      SELECT * FROM attempts
      WHERE user_id = $1
      ORDER BY completed_at DESC
      LIMIT 5
    `;

    const attemptsResult = await db.query(attemptsQuery, [userId]);

    res.json({
      success: true,
      data: {
        stats: statsResult.rows[0] || {},
        recentAttempts: attemptsResult.rows
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Database error" });
  }
});

router.get("/admin", verifyToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Only admins can access this" });
  }

  try {
    const analyticsQuery = `
      SELECT
        (SELECT COUNT(*) FROM quizzes)::int AS total_quizzes,
        (SELECT COUNT(*) FROM users WHERE role = 'STUDENT')::int AS total_students,
        (SELECT COUNT(*) FROM attempts)::int AS total_attempts,
        COALESCE((SELECT AVG(percentage) FROM attempts), 0)::float AS average_score
    `;

    const result = await db.query(analyticsQuery);

    res.json({ success: true, data: result.rows[0] || {} });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Database error" });
  }
});

module.exports = router;