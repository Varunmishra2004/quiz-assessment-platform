const pool = require("../config/db");

const getLeaderboard = async (req, res) => {
    try {
        const { category_id, limit = 20 } = req.query;

        let query = `
            SELECT
                u.id,
                u.name,
                u.email,
                ROUND(AVG(a.percentage)::numeric, 2) AS average_percentage,
                MAX(a.percentage) AS best_percentage,
                COUNT(DISTINCT a.quiz_id) AS completed_quizzes,
                COUNT(*) AS total_attempts
            FROM attempts a
            JOIN users u ON u.id = a.user_id
            WHERE a.status IN ('PASSED', 'FAILED', 'COMPLETED')
        `;

        const values = [];

        if (category_id) {
            query += ` AND EXISTS (
                SELECT 1
                FROM quizzes q
                WHERE q.id = a.quiz_id
                AND q.category_id = $1
            )`;
            values.push(category_id);
        }

        query += `
            GROUP BY u.id, u.name, u.email
            ORDER BY average_percentage DESC, completed_quizzes DESC, best_percentage DESC
            LIMIT $${values.length + 1}
        `;

        values.push(parseInt(limit) || 20);

        const result = await pool.query(query, values);

        res.status(200).json({
            success: true,
            data: result.rows.map((row, index) => ({
                rank: index + 1,
                userId: row.id,
                name: row.name,
                email: row.email,
                averagePercentage: parseFloat(row.average_percentage),
                bestPercentage: row.best_percentage,
                completedQuizzes: parseInt(row.completed_quizzes),
                totalAttempts: parseInt(row.total_attempts)
            }))
        });

    } catch (error) {
        console.error("getLeaderboard error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load leaderboard"
        });
    }
};

module.exports = {
    getLeaderboard
};