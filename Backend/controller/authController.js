const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// =====================================
// REGISTER STUDENT
// =====================================

const register = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // ===============================
        // VALIDATION
        // ===============================

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required"
            });
        }


        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters"
            });
        }


        // ===============================
        // CHECK EXISTING USER
        // ===============================

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );


        if (existingUser.rows.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }


        // ===============================
        // HASH PASSWORD
        // ===============================

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // ===============================
        // CREATE STUDENT
        // ===============================

        const newUser = await pool.query(
            `INSERT INTO users
                (name, email, password, role)
             VALUES
                ($1, $2, $3, 'STUDENT')
             RETURNING id, name, email, role`,
            [
                name,
                email,
                hashedPassword
            ]
        );


        // ===============================
        // RESPONSE
        // ===============================

        res.status(201).json({

            success: true,

            message:
                "Student account created successfully",

            user: newUser.rows[0]
        });


    } catch (error) {

        console.error(
            "Register error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



// =====================================
// LOGIN
// =====================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ===============================
        // FIND USER
        // ===============================

        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );


        if (userResult.rows.length === 0) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }


        const user = userResult.rows[0];


        // ===============================
        // CHECK PASSWORD
        // ===============================

        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isPasswordCorrect) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }


        // ===============================
        // CREATE JWT
        // ===============================

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }
        );


        // ===============================
        // LOGIN RESPONSE
        // ===============================

        res.status(200).json({

            success: true,

            message:
                "Login successful",

            token: token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



// =====================================
// EXPORT
// =====================================

module.exports = {
    register,
    login
};