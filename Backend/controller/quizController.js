const pool = require("../config/db");

// CREATE QUIZ
const createQuiz = async (req, res) => {
    try {
        const {
            title,
            description,
            category_id,
            difficulty,
            duration,
            passing_score,
            max_attempts
        } = req.body;

        if (!title || !duration) {
            return res.status(400).json({
                success: false,
                message: "Title and duration are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO quizzes
            (title, description, category_id, difficulty, duration, passing_score, max_attempts)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                title,
                description || null,
                category_id || null,
                difficulty || "MEDIUM",
                duration,
                passing_score || 60,
                max_attempts || 1
            ]
        );

        res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Create quiz error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// GET ALL QUIZZES
const getAllQuizzes = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM quizzes
             ORDER BY created_at DESC`
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Get quizzes error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// UPDATE QUIZ
const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            category_id,
            difficulty,
            duration,
            passing_score,
            max_attempts,
            status
        } = req.body;

        const result = await pool.query(
            `UPDATE quizzes
             SET title = $1,
                 description = $2,
                 category_id = $3,
                 difficulty = $4,
                 duration = $5,
                 passing_score = $6,
                 max_attempts = $7,
                 status = $8,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $9
             RETURNING *`,
            [
                title,
                description || null,
                category_id || null,
                difficulty || "MEDIUM",
                duration,
                passing_score || 60,
                max_attempts || 1,
                status || "DRAFT",
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Quiz updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Update quiz error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// DELETE QUIZ
const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM quizzes
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Quiz deleted successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Delete quiz error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// PUBLISH / UNPUBLISH QUIZ
const updateQuizStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "DRAFT",
            "PUBLISHED",
            "UNPUBLISHED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz status"
            });
        }

        const result = await pool.query(
            `UPDATE quizzes
             SET status = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `Quiz status changed to ${status}`,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Update quiz status error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createQuiz,
    getAllQuizzes,
    updateQuiz,
    deleteQuiz,
    updateQuizStatus
};