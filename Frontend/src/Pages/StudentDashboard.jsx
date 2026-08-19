import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI, quizAPI } from "../services/api";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStudentDashboard();
      if (response.data.success) {
        setStats(response.data.data.stats);
        setRecentAttempts(response.data.data.recentAttempts || []);
      }
    } catch (err) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="orb one"></div>
      <div className="orb two"></div>

      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="container nav-content">
          <div className="nav-brand">
            <span className="brand-icon">📚</span>
            <span>QuizMaster</span>
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate("/quizzes")}>
              📋 Quizzes
            </button>
            <button className="nav-link" onClick={() => navigate("/attempts")}>
              📊 History
            </button>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="dashboard-content">
        <div className="container">
          {/* HEADER */}
          <section className="dashboard-header">
            <h1 className="section-title">Welcome Back! 👋</h1>
            <p className="subtitle">Keep up your learning streak</p>
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          {/* STATS GRID */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card glass-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <p className="stat-label">Quizzes Attempted</p>
                  <p className="stat-value">
                    {stats?.quizzes_attempted || 0}
                  </p>
                </div>
              </div>

              <div className="stat-card glass-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <p className="stat-label">Quizzes Passed</p>
                  <p className="stat-value">
                    {stats?.passed_quizzes || 0}
                  </p>
                </div>
              </div>

              <div className="stat-card glass-card">
                <div className="stat-icon">❌</div>
                <div className="stat-content">
                  <p className="stat-label">Quizzes Failed</p>
                  <p className="stat-value">
                    {stats?.failed_quizzes || 0}
                  </p>
                </div>
              </div>

              <div className="stat-card glass-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <p className="stat-label">Average Score</p>
                  <p className="stat-value">
                    {stats?.average_percentage ? `${Math.round(stats.average_percentage)}%` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RECENT ATTEMPTS */}
          <section className="recent-section">
            <h2 className="section-title">Recent Attempts</h2>
            {recentAttempts.length > 0 ? (
              <div className="attempts-list">
                {recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="attempt-item glass-card">
                    <div className="attempt-info">
                      <h3>{attempt.quiz_title}</h3>
                      <p className="muted">
                        {new Date(attempt.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="attempt-score">
                      <span className={`badge ${attempt.status.toLowerCase()}`}>
                        {attempt.status}
                      </span>
                      <span className="score-text">
                        {attempt.percentage}%
                      </span>
                    </div>
                    <button
                      className="secondary-btn"
                      onClick={() => navigate(`/result/${attempt.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state glass-card">
                <p className="empty-icon">📭</p>
                <p>No attempts yet. Start taking quizzes!</p>
                <button
                  className="primary-btn"
                  onClick={() => navigate("/quizzes")}
                >
                  Browse Quizzes
                </button>
              </div>
            )}
          </section>

          {/* CTA SECTION */}
          <section className="cta-section">
            <div className="glass-card cta-card">
              <h3>Ready for a challenge?</h3>
              <p>Take a quiz and improve your skills</p>
              <button className="primary-btn" onClick={() => navigate("/quizzes")}>
                Start Quiz Now
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}