import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI, quizAPI } from "../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getAdminAnalytics();
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
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
      <div className="admin-dashboard">
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="orb one"></div>
      <div className="orb two"></div>

      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="container nav-content">
          <div className="nav-brand">
            <span className="brand-icon">⚙️</span>
            <span>Admin Panel</span>
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate("/admin/quizzes")}>
              📋 Manage Quizzes
            </button>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="admin-content">
        <div className="container">
          {/* HEADER */}
          <section className="admin-header">
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="subtitle">Manage quizzes and view analytics</p>
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          {analytics && (
            <>
              {/* STATS GRID */}
              <section className="stats-section">
                <div className="stats-grid">
                  <div className="stat-card glass-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                      <p className="stat-label">Total Quizzes</p>
                      <p className="stat-value">{analytics.total_quizzes || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card glass-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <p className="stat-label">Total Students</p>
                      <p className="stat-value">{analytics.total_students || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card glass-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                      <p className="stat-label">Total Attempts</p>
                      <p className="stat-value">{analytics.total_attempts || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card glass-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <p className="stat-label">Pass Rate</p>
                      <p className="stat-value">
                        {analytics.pass_rate
                          ? `${Math.round(analytics.pass_rate)}%`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ACTIONS */}
              <section className="actions-section">
                <button
                  className="primary-btn action-btn"
                  onClick={() => navigate("/admin/quizzes")}
                >
                  ➕ Create New Quiz
                </button>
                <button
                  className="secondary-btn action-btn"
                  onClick={loadAnalytics}
                >
                  🔄 Refresh Analytics
                </button>
              </section>

              {/* RECENT QUIZZES */}
              {analytics.recent_quizzes && (
                <section className="recent-section">
                  <h2 className="section-title">Recent Quizzes</h2>
                  <div className="quizzes-list">
                    {analytics.recent_quizzes.map((quiz) => (
                      <div key={quiz.id} className="quiz-item glass-card">
                        <div className="quiz-info">
                          <h3>{quiz.title}</h3>
                          <p className="muted">
                            {quiz.total_questions} questions • {quiz.total_attempts || 0} attempts
                          </p>
                        </div>
                        <div className="quiz-stats">
                          <span className="quiz-stat">
                            📊 Avg: {quiz.average_score ? `${Math.round(quiz.average_score)}%` : "N/A"}
                          </span>
                        </div>
                        <button
                          className="secondary-btn"
                          onClick={() => navigate(`/admin/questions/${quiz.id}`)}
                        >
                          Edit Questions
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* TOP STUDENTS */}
              {analytics.top_students && (
                <section className="top-students-section">
                  <h2 className="section-title">Top Performers</h2>
                  <div className="students-list">
                    {analytics.top_students.map((student, index) => (
                      <div key={student.user_id} className="student-item glass-card">
                        <div className="student-rank">#{index + 1}</div>
                        <div className="student-info">
                          <h4>{student.user_name}</h4>
                          <p className="muted">{student.email}</p>
                        </div>
                        <div className="student-stats">
                          <span className="stat">
                            {student.attempts} attempts
                          </span>
                          <span className="stat highlight">
                            {Math.round(student.average_percentage)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}