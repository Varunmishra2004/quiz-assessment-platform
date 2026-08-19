import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./Login.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);

      if (response.data.success && response.data.user?.role?.toUpperCase() === "ADMIN") {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", "ADMIN");
        localStorage.setItem("userId", String(response.data.user.id));
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/admin/dashboard");
      } else {
        setError("Admin access denied");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page auth-page">
      <div className="orb one"></div>
      <div className="orb two"></div>

      <div className="auth-container">
        <div className="auth-card glass-card fade-in">
          <div className="auth-header">
            <div className="logo-badge admin-badge">
              <span>⚙️</span>
            </div>
            <h1>Admin Portal</h1>
            <p>Sign in to manage quizzes</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Admin Email</label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="admin@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="primary-btn auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-mini"></span>
                  Signing in...
                </>
              ) : (
                "Admin Login"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Student? <Link to="/login">Student Login</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .admin-badge {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(168, 85, 247, 0.1));
          border-color: rgba(239, 68, 68, 0.25);
        }
      `}</style>
    </div>
  );
}