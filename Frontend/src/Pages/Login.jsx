import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./Login.css";

export default function Login() {
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
      
      if (response.data.success) {
        const user = response.data.user;

        if (!response.data.token || !user?.id || !user?.role) {
          throw new Error("Invalid login response from server");
        }

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", user.role.toUpperCase());
        localStorage.setItem("userId", String(user.id));
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/dashboard");
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page auth-page">
      <div className="orb one"></div>
      <div className="orb two"></div>

      <div className="auth-container">
        <div className="auth-card glass-card fade-in">
          <div className="auth-header">
            <div className="logo-badge">
              <span>📚</span>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your student account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="your@email.com"
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
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
            <p>
              Are you an admin? <Link to="/admin-login">Admin Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}