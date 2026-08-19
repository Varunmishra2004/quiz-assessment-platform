import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPages.css";

function StudentLogin() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Invalid email or password"
                );
            }

            const role =
                data.user?.role?.toUpperCase();

            if (role !== "STUDENT") {

                throw new Error(
                    "This account is not a Student account."
                );
            }

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "userRole",
                role
            );

            localStorage.setItem(
                "userId",
                data.user.id
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            navigate("/dashboard");

        } catch (error) {

            console.error(
                "Student login error:",
                error
            );

            setError(
                error.message ||
                "Login failed"
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="auth-page">

            <div className="auth-card">

                <button
                    className="auth-back"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    ← Back
                </button>

                <div className="auth-icon student-auth-icon">
                    🎓
                </div>

                <span className="auth-label">
                    STUDENT PORTAL
                </span>

                <h1>
                    Student Login
                </h1>

                <p className="auth-description">
                    Login to take quizzes and
                    track your performance.
                </p>


                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}


                <form onSubmit={handleLogin}>

                    <label>
                        Email Address
                    </label>

                    <input
                        type="email"
                        placeholder="student@example.com"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />


                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />


                    <button
                        className="auth-submit student-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Login as Student →"}
                    </button>

                </form>


                <div className="auth-divider">
                    <span>
                        Don't have an account?
                    </span>
                </div>


                <button
                    className="auth-signup"
                    onClick={() =>
                        navigate("/signup")
                    }
                >
                    Create Student Account
                </button>


                <button
                    className="switch-login"
                    onClick={() =>
                        navigate("/login/admin")
                    }
                >
                    Login as Administrator
                </button>

            </div>

        </div>
    );
}

export default StudentLogin;