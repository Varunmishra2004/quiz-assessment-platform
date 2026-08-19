const pool = require("../config/db");

const getPublishedQuizzes = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                id,
                title,
                description,
                     category_id,
                     duration AS duration_minutes,
                     (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id)::int AS total_questions,
                passing_score,
                status
                 FROM quizzes q
                 WHERE status = 'PUBLISHED'
                 ORDER BY created_at DESC`
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("getPublishedQuizzes error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch quizzes"
        });
    }
};

const getQuizDetails = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quizResult = await pool.query(
            `SELECT 
                id,
                title,
                description,
                     category_id,
                     duration AS duration_minutes,
                     (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id)::int AS total_questions,
                passing_score,
                max_attempts,
                status
                 FROM quizzes q
             WHERE id = $1 AND status = 'PUBLISHED'`,
            [quizId]
        );

        if (quizResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found or not published"
            });
        }

        res.status(200).json({
            success: true,
            data: quizResult.rows[0]
        });

    } catch (error) {
        console.error("getQuizDetails error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch quiz details"
        });
    }
};

const startQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id;

        const quizResult = await pool.query(
            `SELECT
                id,
                title,
                duration AS duration_minutes,
                passing_score,
                max_attempts,
                status
             FROM quizzes
             WHERE id = $1`,
            [quizId]
        );

        if (quizResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        const quiz = quizResult.rows[0];

        if (quiz.status !== "PUBLISHED") {
            return res.status(403).json({
                success: false,
                message: "Quiz is not published"
            });
        }

        const durationMinutes = parseInt(
            quiz.duration_minutes || 30,
            10
        );

        // Check existing active attempt
        const activeResult = await pool.query(
            `SELECT
                id,
                started_at
             FROM attempts
             WHERE user_id = $1
             AND quiz_id = $2
             AND status = 'ACTIVE'
             ORDER BY started_at DESC
             LIMIT 1`,
            [userId, quizId]
        );

        if (activeResult.rows.length > 0) {

            const activeAttempt = activeResult.rows[0];

            const startedAt = new Date(
                activeAttempt.started_at
            );

            const endsAt = new Date(
                startedAt.getTime() +
                durationMinutes * 60 * 1000
            );

            const currentTime = new Date();

            // Resume existing attempt
            if (currentTime < endsAt) {

                const questionsResult = await pool.query(
                    `SELECT
                        q.id,
                        q.question_text,
                        q.marks,
                        COALESCE(
                            json_agg(
                                json_build_object(
                                    'id', o.id,
                                    'text', o.option_text
                                )
                                ORDER BY o.id
                            ) FILTER (WHERE o.id IS NOT NULL),
                            '[]'::json
                        ) AS options
                     FROM questions q
                     LEFT JOIN options o
                        ON o.question_id = q.id
                     WHERE q.quiz_id = $1
                     GROUP BY
                        q.id,
                        q.question_text,
                        q.marks
                     ORDER BY q.id`,
                    [quizId]
                );

                return res.status(200).json({
                    success: true,
                    message: "Existing quiz attempt resumed",
                    data: {
                        attemptId: activeAttempt.id,
                        quizId: parseInt(quizId, 10),
                        quizTitle: quiz.title,
                        durationMinutes,
                        startedAt,
                        endsAt,
                        questions: questionsResult.rows,
                        resumed: true
                    }
                });
            }

            // Expired active attempt
            await pool.query(
                `UPDATE attempts
                 SET
                    status = 'FAILED',
                    completed_at = $1,
                    time_taken = $2
                 WHERE id = $3
                 AND status = 'ACTIVE'`,
                [
                    currentTime,
                    durationMinutes * 60,
                    activeAttempt.id
                ]
            );
        }

        // Check previous attempts
        const attemptResult = await pool.query(
            `SELECT COUNT(*) AS count
             FROM attempts
             WHERE user_id = $1
             AND quiz_id = $2
             AND status IN (
                'COMPLETED',
                'PASSED',
                'FAILED'
             )`,
            [userId, quizId]
        );

        const completedAttempts = parseInt(
            attemptResult.rows[0].count || 0,
            10
        );

        const maxAttempts = parseInt(
            quiz.max_attempts || 0,
            10
        );

        if (
            maxAttempts > 0 &&
            completedAttempts >= maxAttempts
        ) {
            return res.status(403).json({
                success: false,
                message: "Maximum attempts reached for this quiz"
            });
        }

        // Create new attempt
        const startedAt = new Date();

        const newAttemptResult = await pool.query(
            `INSERT INTO attempts
                (
                    quiz_id,
                    user_id,
                    status,
                    started_at,
                    completed_at,
                    time_taken,
                    score,
                    percentage,
                    correct_answers,
                    incorrect_answers,
                    unanswered
                )
             VALUES
                (
                    $1,
                    $2,
                    'ACTIVE',
                    $3,
                    NULL,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                )
             RETURNING id, started_at`,
            [
                quizId,
                userId,
                startedAt
            ]
        );

        const attempt = newAttemptResult.rows[0];

        const endsAt = new Date(
            startedAt.getTime() +
            durationMinutes * 60 * 1000
        );

        // Get questions
        // q.type intentionally removed because
        // the questions table does not contain a type column.
        const questionsResult = await pool.query(
            `SELECT
                q.id,
                q.question_text,
                q.marks,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', o.id,
                            'text', o.option_text
                        )
                        ORDER BY o.id
                    ) FILTER (WHERE o.id IS NOT NULL),
                    '[]'::json
                ) AS options
             FROM questions q
             LEFT JOIN options o
                ON o.question_id = q.id
             WHERE q.quiz_id = $1
             GROUP BY
                q.id,
                q.question_text,
                q.marks
             ORDER BY q.id`,
            [quizId]
        );

        return res.status(200).json({
            success: true,
            message: "Quiz started successfully",
            data: {
                attemptId: attempt.id,
                quizId: parseInt(quizId, 10),
                quizTitle: quiz.title,
                durationMinutes,
                startedAt,
                endsAt,
                questions: questionsResult.rows,
                resumed: false
            }
        });

    } catch (error) {
        console.error("startQuiz error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to start quiz",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
};

const submitQuiz = async (req, res) => {
    const client = await pool.connect();

    try {
        const { quizId } = req.params;
        const userId = req.user.id;
        const { attemptId, answers = [] } = req.body;

        if (!attemptId) {
            return res.status(400).json({
                success: false,
                message: "Attempt ID is required"
            });
        }

        const quizResult = await client.query(
            `SELECT 
                id,
                title,
                duration_minutes,
                passing_score,
                status
             FROM quizzes
             WHERE id = $1`,
            [quizId]
        );

        if (quizResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        const quiz = quizResult.rows[0];

        if (quiz.status !== "PUBLISHED") {
            return res.status(403).json({
                success: false,
                message: "Quiz is not published"
            });
        }

        const attemptCheckResult = await client.query(
            `SELECT id, started_at, status FROM attempts 
             WHERE id = $1 AND user_id = $2 AND quiz_id = $3`,
            [attemptId, userId, quizId]
        );

        if (attemptCheckResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found"
            });
        }

        const attempt = attemptCheckResult.rows[0];

        if (attempt.status !== "ACTIVE") {
            return res.status(409).json({
                success: false,
                message: "This attempt is already completed or expired"
            });
        }

        const now = new Date();
        const startedAt = new Date(attempt.started_at);
        const durationSeconds = parseInt(quiz.duration_minutes || 30) * 60;
        const elapsedSeconds = Math.floor((now - startedAt) / 1000);
        const isExpired = elapsedSeconds > durationSeconds;

        let serverTimeTaken = elapsedSeconds;
        if (isExpired) {
            serverTimeTaken = durationSeconds;
        }

        const questionsResult = await client.query(
            `SELECT 
                q.id,
                q.marks,
                o.id as correct_option_id
             FROM questions q
             LEFT JOIN options o ON o.question_id = q.id AND o.is_correct = true
             WHERE q.quiz_id = $1
             ORDER BY q.id`,
            [quizId]
        );

        const questions = questionsResult.rows;

        await client.query("BEGIN");

        const answerMap = new Map();
        for (const answer of answers) {
            const qid = parseInt(answer.questionId);
            const optId = answer.selectedOptionId ? parseInt(answer.selectedOptionId) : null;
            answerMap.set(qid, optId);
        }

        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let unanswered = 0;
        let totalScore = 0;
        let totalMarks = 0;

        const questionsByIdMap = new Map();
        for (const question of questions) {
            if (!questionsByIdMap.has(question.id)) {
                questionsByIdMap.set(question.id, {
                    id: question.id,
                    marks: question.marks,
                    correctOptionIds: []
                });
            }
            if (question.correct_option_id) {
                questionsByIdMap.get(question.id).correctOptionIds.push(question.correct_option_id);
            }
        }

        for (const [qid, qData] of questionsByIdMap.entries()) {
            const selectedOptionId = answerMap.get(qid) || null;
            const correctOptionIds = qData.correctOptionIds;
            const marks = parseInt(qData.marks || 0);

            totalMarks += marks;

            let isCorrect = false;

            if (!selectedOptionId) {
                unanswered++;
            } else if (correctOptionIds.includes(selectedOptionId)) {
                correctAnswers++;
                totalScore += marks;
                isCorrect = true;
            } else {
                incorrectAnswers++;
            }

            await client.query(
                `INSERT INTO answers (attempt_id, question_id, selected_option_id, is_correct)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (attempt_id, question_id) 
                 DO UPDATE SET selected_option_id = $3, is_correct = $4`,
                [attemptId, qid, selectedOptionId, isCorrect]
            );
        }

        const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;
        const passingScore = parseInt(quiz.passing_score || 60);
        const status = percentage >= passingScore ? "PASSED" : "FAILED";

        await client.query(
            `UPDATE attempts
             SET
                status = $1,
                completed_at = $2,
                time_taken = $3,
                score = $4,
                percentage = $5,
                correct_answers = $6,
                incorrect_answers = $7,
                unanswered = $8
             WHERE id = $9`,
            [status, now, serverTimeTaken, totalScore, Math.round(percentage * 100) / 100, correctAnswers, incorrectAnswers, unanswered, attemptId]
        );

        await client.query("COMMIT");

        res.status(200).json({
            success: true,
            message: "Quiz submitted successfully",
            data: {
                attemptId,
                quizId: parseInt(quizId),
                status,
                score: totalScore,
                totalMarks,
                percentage: Math.round(percentage * 100) / 100,
                correctAnswers,
                incorrectAnswers,
                unanswered,
                timeTaken: serverTimeTaken,
                isExpired,
                completedAt: now
            }
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("submitQuiz error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit quiz"
        });
    } finally {
        client.release();
    }
};

const getAttemptResult = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const userId = req.user.id;

        const attemptResult = await pool.query(
            `SELECT a.*, q.title as quiz_title
             FROM attempts a
             JOIN quizzes q ON q.id = a.quiz_id
             WHERE a.id = $1 AND a.user_id = $2`,
            [attemptId, userId]
        );

        if (attemptResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found"
            });
        }

        const attempt = attemptResult.rows[0];

        const answersResult = await pool.query(
            `SELECT 
                ans.question_id,
                ans.selected_option_id,
                ans.is_correct,
                q.question_text,
                q.marks,
                so.option_text as selected_option_text,
                co.option_text as correct_option_text
             FROM answers ans
             JOIN questions q ON q.id = ans.question_id
             LEFT JOIN options so ON so.id = ans.selected_option_id
             LEFT JOIN options co ON co.question_id = q.id AND co.is_correct = true
             WHERE ans.attempt_id = $1
             ORDER BY q.id`,
            [attemptId]
        );

        res.status(200).json({
            success: true,
            data: {
                attemptId: attempt.id,
                quizTitle: attempt.quiz_title,
                status: attempt.status,
                score: attempt.score,
                totalMarks: answersResult.rows.reduce((sum, a) => sum + parseInt(a.marks || 0), 0),
                percentage: attempt.percentage,
                correctAnswers: attempt.correct_answers,
                incorrectAnswers: attempt.incorrect_answers,
                unanswered: attempt.unanswered,
                timeTaken: attempt.time_taken,
                startedAt: attempt.started_at,
                completedAt: attempt.completed_at,
                answers: answersResult.rows.map(row => ({
                    questionId: row.question_id,
                    questionText: row.question_text,
                    marks: parseInt(row.marks || 0),
                    selectedOption: row.selected_option_text,
                    correctOption: row.correct_option_text,
                    isCorrect: row.is_correct
                }))
            }
        });

    } catch (error) {
        console.error("getAttemptResult error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch attempt result"
        });
    }
};

const getAttemptHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT a.id, a.quiz_id, q.title as quiz_title, a.status, a.score, a.percentage, a.correct_answers, a.incorrect_answers, a.unanswered, a.time_taken, a.started_at, a.completed_at
             FROM attempts a
             JOIN quizzes q ON q.id = a.quiz_id
             WHERE a.user_id = $1
             ORDER BY a.completed_at DESC NULLS LAST`,
            [userId]
        );

        res.status(200).json({
            success: true,
            data: result.rows.map(row => ({
                id: row.id,
                quizId: row.quiz_id,
                quizTitle: row.quiz_title,
                status: row.status,
                score: row.score,
                percentage: row.percentage,
                correctAnswers: row.correct_answers,
                incorrectAnswers: row.incorrect_answers,
                unanswered: row.unanswered,
                timeTaken: row.time_taken,
                startedAt: row.started_at,
                completedAt: row.completed_at
            }))
        });

    } catch (error) {
        console.error("getAttemptHistory error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch attempt history"
        });
    }
};

const getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const statsResult = await pool.query(
            `SELECT
                COUNT(DISTINCT quiz_id) as quizzes_attempted,
                COUNT(*) FILTER (WHERE status IN ('PASSED', 'FAILED', 'COMPLETED')) as completed_attempts,
                COUNT(*) FILTER (WHERE status = 'PASSED') as passed_quizzes,
                COUNT(*) FILTER (WHERE status = 'FAILED') as failed_quizzes,
                ROUND(AVG(percentage)::numeric, 2) as average_percentage,
                MAX(percentage) as best_percentage
             FROM attempts
             WHERE user_id = $1`,
            [userId]
        );

        const recentResult = await pool.query(
            `SELECT a.id, a.quiz_id, q.title as quiz_title, a.status, a.percentage, a.completed_at
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
                stats: statsResult.rows[0],
                recentAttempts: recentResult.rows
            }
        });

    } catch (error) {
        console.error("getStudentDashboard error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load dashboard"
        });
    }
};

module.exports = {
    getPublishedQuizzes,
    getQuizDetails,
    startQuiz,
    submitQuiz,
    getAttemptResult,
    getAttemptHistory,
    getStudentDashboard
};