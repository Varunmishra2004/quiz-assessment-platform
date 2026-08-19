import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";
import "./QuizResult.css";

export default function QuizResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    loadResult();
  }, [attemptId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getAttemptResult(attemptId);
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load result");
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
      <div className="result-page">
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-page">
        <div className="container">
          <div className="error-state glass-card">
            <p>{error || "Result not found"}</p>
            <button className="primary-btn" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const passed = result.status === "PASSED";
  const percentage = Math.round(result.percentage);

  return (
    <div className="result-page">
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

      {/* RESULT CONTENT */}
      <main className="result-content">
        <div className="container">
          {/* SCORE CARD */}
          <div className={`score-card glass-card ${passed ? "passed" : "failed"}`}>
            <div className="score-visual">
              <div className={`score-circle ${passed ? "passed" : "failed"}`}>
                <span className="score-percentage">{percentage}%</span>
              </div>
            </div>

            <div className="score-info">
              <h1 className={`score-title ${passed ? "success" : "danger"}`}>
                {passed ? "🎉 Quiz Passed!" : "❌ Quiz Failed"}
              </h1>
              <p className="score-subtitle">
                {result.quiz_title}
              </p>

              <div className="score-stats">
                <div className="score-stat">
                  <span className="stat-label">Score</span>
                  <span className="stat-value">{result.score}/{result.total_marks}</span>
                </div>
                <div className="score-stat">
                  <span className="stat-label">Correct Answers</span>
                  <span className="stat-value correct">{result.correct_answers}/{result.total_questions}</span>
                </div>
                <div className="score-stat">
                  <span className="stat-label">Wrong Answers</span>
                  <span className="stat-value wrong">{result.wrong_answers}/{result.total_questions}</span>
                </div>
                <div className="score-stat">
                  <span className="stat-label">Time Taken</span>
                  <span className="stat-value">{result.time_taken_seconds ? `${Math.floor(result.time_taken_seconds / 60)}m ${result.time_taken_seconds % 60}s` : "N/A"}</span>
                </div>
              </div>

              <div className="score-actions">
                <button className="primary-btn" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </button>
                <button className="secondary-btn" onClick={() => navigate("/quizzes")}>
                  Take Another Quiz
                </button>
              </div>
            </div>
          </div>

          {/* ANSWER REVIEW */}
          <section className="review-section">
            <h2 className="section-title">Answer Review</h2>

            <div className="answers-list">
              {result.answers?.map((answer, index) => {
                const isCorrect = answer.is_correct;
                const expanded = expandedQuestion === answer.question_id;

                return (
                  <div
                    key={answer.question_id}
                    className={`answer-item glass-card ${isCorrect ? "correct" : "incorrect"}`}
                  >
                    <button
                      className="answer-header"
                      onClick={() =>
                        setExpandedQuestion(
                          expanded ? null : answer.question_id
                        )
                      }
                    >
                      <div className="answer-header-left">
                        <span className={`answer-status ${isCorrect ? "correct" : "incorrect"}`}>
                          {isCorrect ? "✓" : "✗"}
                        </span>
                        <div className="answer-title">
                          <p className="question-text">
                            {index + 1}. {answer.question_text}
                          </p>
                          <p className="answer-marks">
                            {answer.marks} mark{answer.marks !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="expand-icon">
                        {expanded ? "−" : "+"}
                      </span>
                    </button>

                    {expanded && (
                      <div className="answer-details">
                        <div className="answer-option">
                          <span className="option-label">Your Answer:</span>
                          <p className={`option-text ${isCorrect ? "correct" : "incorrect"}`}>
                            {answer.selected_option_text || "Not answered"}
                          </p>
                        </div>

                        {!isCorrect && (
                          <div className="answer-option">
                            <span className="option-label">Correct Answer:</span>
                            <p className="option-text correct">
                              {answer.correct_option_text}
                            </p>
                          </div>
                        )}

                        {answer.explanation && (
                          <div className="answer-option">
                            <span className="option-label">Explanation:</span>
                            <p className="option-text explanation">
                              {answer.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}