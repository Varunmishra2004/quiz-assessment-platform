import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";
import "./StudentDashboard.css";

export default function StudentQuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getPublishedQuizzes();
      if (response.data.success) {
        setQuizzes(response.data.data);
      }
    } catch (err) {
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
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
            <button className="nav-link" onClick={() => navigate("/dashboard")}>
              📊 Dashboard
            </button>
            <button className="nav-link" onClick={() => navigate("/attempts")}>
              📋 History
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
            <h1 className="section-title">Available Quizzes</h1>
            <p className="subtitle">Choose a quiz and test your knowledge</p>
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          {/* SEARCH */}
          <div className="search-section" style={{ marginBottom: "2rem" }}>
            <input
              type="text"
              className="input-field"
              placeholder="🔍 Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: "500px" }}
            />
          </div>

          {/* QUIZ GRID */}
          {filteredQuizzes.length > 0 ? (
            <div
              className="quizzes-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem"
              }}
            >
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-card glass-card">
                  <div className="quiz-header">
                    <h3>{quiz.title}</h3>
                    <span className="quiz-badge">
                      {quiz.total_questions} Q
                    </span>
                  </div>
                  <p className="quiz-description">{quiz.description}</p>
                  <div className="quiz-meta">
                    <span>⏱️ {quiz.duration_minutes} min</span>
                    <span>🎯 Pass: {quiz.passing_score}%</span>
                  </div>
                  <button
                    className="primary-btn"
                    onClick={() => handleStartQuiz(quiz.id)}
                    style={{ width: "100%", marginTop: "1rem" }}
                  >
                    Start Quiz →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-card">
              <p className="empty-icon">🎯</p>
              <p>{searchTerm ? "No quizzes found" : "No quizzes available"}</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .quiz-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .quiz-card:hover {
          transform: translateY(-8px);
          border-color: rgba(139, 92, 246, 0.5);
        }

        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .quiz-header h3 {
          margin: 0;
          font-size: 1.2rem;
          color: white;
          flex: 1;
        }

        .quiz-badge {
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.4);
          color: #c4b5fd;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .quiz-description {
          color: var(--text-soft);
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0 0 1rem;
          flex: 1;
        }

        .quiz-meta {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 0.9rem;
          color: var(--text-soft);
        }

        .search-section {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}