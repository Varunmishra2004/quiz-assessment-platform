const pool = require("../config/db");

const getAllStudents = async (req, res) => {
    try {

        const students = await pool.query(
            `SELECT id, name, email, role, created_at
             FROM users
             WHERE role = 'STUDENT'
             ORDER BY created_at DESC`
        );

        res.status(200).json({
            success: true,
            data: students.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    getAllStudents
};