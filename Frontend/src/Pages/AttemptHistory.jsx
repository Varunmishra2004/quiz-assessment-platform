import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";
import "./AttemptHistory.css";

export default function AttemptHistory() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getAttemptHistory();
      if (response.data.success) {
        setAttempts(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attempts");
    } finally {
      setLoading(false);
    }
  };

  const filteredAttempts = attempts.filter((attempt) => {
    if (filterStatus === "ALL") return true;
    return attempt.status === filterStatus;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
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
            <button className="nav-link" onClick={() => navigate("/dashboard")}>
              📊 Dashboard
            </button>
            <button className="nav-link" onClick={() => navigate("/quizzes")}>
              📋 Quizzes
            </button>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="history-content">
        <div className="container">
          {/* HEADER */}
          <section className="history-header">
            <h1 className="section-title">Attempt History</h1>
            <p className="subtitle">Review all your quiz attempts</p>
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          {/* FILTERS */}
          <div className="filter-section">
            <div className="filter-buttons">
              {["ALL", "PASSED", "FAILED", "COMPLETED"].map((status) => (
                <button
                  key={status}
                  className={`filter-btn ${
                    filterStatus === status ? "active" : ""
                  }`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status === "ALL" ? "All Attempts" : status}
                </button>
              ))}
            </div>
            <div className="filter-info">
              Showing {filteredAttempts.length} of {attempts.length} attempts
            </div>
          </div>

          {/* ATTEMPTS TABLE */}
          {filteredAttempts.length > 0 ? (
            <div className="attempts-table-wrapper">
              <table className="attempts-table">
                <thead>
                  <tr>
                    <th>Quiz Name</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Attempted On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map((attempt) => (
                    <tr key={attempt.id} className={`status-${attempt.status.toLowerCase()}`}>
                      <td className="quiz-name">
                        <span className="quiz-icon">📝</span>
                        {attempt.quiz_title}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${attempt.status.toLowerCase()}`}
                        >
                          {attempt.status}
                        </span>
                      </td>
                      <td className="score-cell">
                        <span className="score">
                          {attempt.score}/{attempt.total_marks}
                        </span>
                      </td>
                      <td className="percentage-cell">
                        <div className="percentage-bar">
                          <div
                            className={`bar-fill ${
                              attempt.status === "PASSED" ? "passed" : "failed"
                            }`}
                            style={{ width: `${attempt.percentage}%` }}
                          ></div>
                        </div>
                        <span className="percentage-text">
                          {Math.round(attempt.percentage)}%
                        </span>
                      </td>
                      <td className="date-cell">
                        {new Date(attempt.completed_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          }
                        )}
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => navigate(`/result/${attempt.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state glass-card">
              <p className="empty-icon">📭</p>
              <p>
                {filterStatus === "ALL"
                  ? "No attempts yet. Start taking quizzes!"
                  : `No ${filterStatus.toLowerCase()} attempts found`}
              </p>
              <button
                className="primary-btn"
                onClick={() => navigate("/quizzes")}
              >
                Take a Quiz
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}