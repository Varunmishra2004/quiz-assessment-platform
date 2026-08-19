const pool = require("../config/db");


// =====================================
// CREATE QUESTION
// =====================================
const createQuestion = async (req, res) => {
    const client = await pool.connect();

    try {
        const { quizId } = req.params;

        const {
            question_text,
            marks,
            explanation,
            difficulty,
            options
        } = req.body;

        if (!question_text) {
            return res.status(400).json({
                success: false,
                message: "Question text is required"
            });
        }

        if (!options || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: "At least 2 options are required"
            });
        }

        const correctOptions = options.filter(
            option => option.is_correct === true
        );

        if (correctOptions.length !== 1) {
            return res.status(400).json({
                success: false,
                message: "Exactly one option must be correct"
            });
        }

        await client.query("BEGIN");

        // Check quiz exists
        const quiz = await client.query(
            "SELECT id FROM quizzes WHERE id = $1",
            [quizId]
        );

        if (quiz.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        // Create question
        const questionResult = await client.query(
            `INSERT INTO questions
            (quiz_id, question_text, marks, explanation, difficulty)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                quizId,
                question_text,
                marks || 1,
                explanation || null,
                difficulty || "MEDIUM"
            ]
        );

        const question = questionResult.rows[0];

        // Create options
        for (const option of options) {
            await client.query(
                `INSERT INTO options
                (question_id, option_text, is_correct)
                VALUES ($1, $2, $3)`,
                [
                    question.id,
                    option.option_text,
                    option.is_correct === true
                ]
            );
        }

        const optionsResult = await client.query(
            `SELECT *
             FROM options
             WHERE question_id = $1
             ORDER BY id`,
            [question.id]
        );

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Question created successfully",
            data: {
                question,
                options: optionsResult.rows
            }
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Create question error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    } finally {
        client.release();
    }
};


// =====================================
// GET QUESTIONS FOR QUIZ
// =====================================
const getQuizQuestions = async (req, res) => {
    try {
        const { quizId } = req.params;

        const result = await pool.query(
            `SELECT
                q.id,
                q.quiz_id,
                q.question_text,
                q.marks,
                q.explanation,
                q.difficulty,
                q.created_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', o.id,
                            'option_text', o.option_text,
                            'is_correct', o.is_correct
                        )
                        ORDER BY o.id
                    ) FILTER (WHERE o.id IS NOT NULL),
                    '[]'
                ) AS options
             FROM questions q
             LEFT JOIN options o
             ON q.id = o.question_id
             WHERE q.quiz_id = $1
             GROUP BY q.id
             ORDER BY q.id`,
            [quizId]
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error("Get questions error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};


// =====================================
// UPDATE QUESTION
// =====================================
const updateQuestion = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        const {
            question_text,
            marks,
            explanation,
            difficulty,
            options
        } = req.body;

        await client.query("BEGIN");

        const questionResult = await client.query(
            `UPDATE questions
             SET question_text = $1,
                 marks = $2,
                 explanation = $3,
                 difficulty = $4
             WHERE id = $5
             RETURNING *`,
            [
                question_text,
                marks || 1,
                explanation || null,
                difficulty || "MEDIUM",
                id
            ]
        );

        if (questionResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Update options if provided
        if (Array.isArray(options)) {

            const correctOptions = options.filter(
                option => option.is_correct === true
            );

            if (correctOptions.length !== 1) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    success: false,
                    message: "Exactly one option must be correct"
                });
            }

            await client.query(
                "DELETE FROM options WHERE question_id = $1",
                [id]
            );

            for (const option of options) {
                await client.query(
                    `INSERT INTO options
                    (question_id, option_text, is_correct)
                    VALUES ($1, $2, $3)`,
                    [
                        id,
                        option.option_text,
                        option.is_correct === true
                    ]
                );
            }
        }

        await client.query("COMMIT");

        res.status(200).json({
            success: true,
            message: "Question updated successfully",
            data: questionResult.rows[0]
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Update question error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    } finally {
        client.release();
    }
};


// =====================================
// DELETE QUESTION
// =====================================
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM questions
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Question deleted successfully",
            data: result.rows[0]
        });

    } catch (error) {

        console.error("Delete question error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};


module.exports = {
    createQuestion,
    getQuizQuestions,
    updateQuestion,
    deleteQuestion
};