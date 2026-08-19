const pool = require("../config/db");

const getAdminAnalytics = async (req, res) => {
    try {
        const studentStats = await pool.query(`
            SELECT
                COUNT(*) AS total_students,
                COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active_students,
                COUNT(*) FILTER (WHERE status = 'INACTIVE') AS inactive_students,
                COUNT(DISTINCT id) FILTER (WHERE id IN (SELECT DISTINCT user_id FROM attempts)) AS students_with_attempts
            FROM users
            WHERE role = 'STUDENT'
        `);

        const quizStats = await pool.query(`
            SELECT
                COUNT(*) AS total_quizzes,
                COUNT(*) FILTER (WHERE status = 'PUBLISHED') AS published_quizzes,
                COUNT(*) FILTER (WHERE status != 'PUBLISHED') AS draft_quizzes
            FROM quizzes
        `);

        const attemptStats = await pool.query(`
            SELECT
                COUNT(*) AS total_attempts,
                COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'PASSED', 'FAILED')) AS completed_attempts,
                ROUND(AVG(percentage)::numeric, 2) AS average_percentage,
                COUNT(*) FILTER (WHERE status = 'PASSED') AS pass_count,
                COUNT(*) FILTER (WHERE status = 'FAILED') AS fail_count
            FROM attempts
        `);

        const attemptsByDate = await pool.query(`
            SELECT
                DATE(completed_at) AS date,
                COUNT(*) AS attempts
            FROM attempts
            WHERE completed_at IS NOT NULL
            AND completed_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(completed_at)
            ORDER BY DATE(completed_at) DESC
        `);

        const quizPerformance = await pool.query(`
            SELECT
                q.id,
                q.title,
                COUNT(*) AS total_attempts,
                ROUND(AVG(a.percentage)::numeric, 2) AS average_percentage,
                COUNT(*) FILTER (WHERE a.status = 'PASSED') AS pass_count,
                COUNT(*) FILTER (WHERE a.status = 'FAILED') AS fail_count
            FROM quizzes q
            LEFT JOIN attempts a ON q.id = a.quiz_id
            GROUP BY q.id, q.title
            ORDER BY total_attempts DESC
            LIMIT 10
        `);

        res.status(200).json({
            success: true,
            data: {
                students: studentStats.rows[0],
                quizzes: quizStats.rows[0],
                attempts: attemptStats.rows[0],
                attemptsByDate: attemptsByDate.rows,
                quizPerformance: quizPerformance.rows
            }
        });

    } catch (error) {
        console.error("getAdminAnalytics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load admin analytics"
        });
    }
};

module.exports = {
    getAdminAnalytics
};