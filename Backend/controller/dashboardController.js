const pool = require("../config/db");

const getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await pool.query(
            `SELECT
                COUNT(DISTINCT quiz_id) AS quizzes_attempted,
                COUNT(*) FILTER (WHERE status IN ('PASSED', 'FAILED', 'COMPLETED')) AS completed_attempts,
                COUNT(*) FILTER (WHERE status = 'PASSED') AS passed_quizzes,
                COUNT(*) FILTER (WHERE status = 'FAILED') AS failed_quizzes,
                ROUND(AVG(percentage)::numeric, 2) AS average_percentage,
                MAX(percentage) AS best_percentage
             FROM attempts
             WHERE user_id = $1`,
            [userId]
        );

        const recent = await pool.query(
            `SELECT a.id, a.quiz_id, q.title AS quiz_title, a.status, a.percentage, a.score, a.completed_at
             FROM attempts a
             JOIN quizzes q ON q.id = a.quiz_id
             WHERE a.user_id = $1
             ORDER BY a.completed_at DESC NULLS LAST
             LIMIT 5`,
            [userId]
        );

        res.status(200).json({
            success: true,
            data: {
                stats: stats.rows[0],
                recentAttempts: recent.rows
            }
        });

    } catch (error) {
        console.error("getStudentDashboard error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load student dashboard"
        });
    }
};

module.exports = {
    getStudentDashboard
};