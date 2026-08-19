import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";
import "./QuizManagement.css";

export default function QuizManagement() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 30,
    passing_score: 60,
    category_id: 1
  });

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getAllQuizzes();
      if (response.data.success) {
        setQuizzes(response.data.data);
      }
    } catch (err) {
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("minutes") || name.includes("score") ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await quizAPI.createQuiz(formData);
      if (response.data.success) {
        setFormData({
          title: "",
          description: "",
          duration_minutes: 30,
          passing_score: 60,
          category_id: 1
        });
        setShowForm(false);
        loadQuizzes();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz");
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const response = await quizAPI.deleteQuiz(quizId);
      if (response.data.success) {
        loadQuizzes();
      }
    } catch (err) {
      setError("Failed to delete quiz");
    }
  };

  const handlePublishQuiz = async (quizId) => {
    try {
      const response = await quizAPI.publishQuiz(quizId);
      if (response.data.success) {
        loadQuizzes();
      }
    } catch (err) {
      setError("Failed to publish quiz");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="quiz-management">
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-management">
      <div className="orb one"></div>
      <div className="orb two"></div>

      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="container nav-content">
          <div className="nav-brand">
            <span className="brand-icon">⚙️</span>
            <span>Quiz Management</span>
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate("/admin/dashboard")}>
              📊 Dashboard
            </button>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="management-content">
        <div className="container">
          {/* HEADER */}
          <section className="management-header">
            <h1 className="section-title">Quiz Management</h1>
            <button
              className="primary-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "➕ Create New Quiz"}
            </button>
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          {/* CREATE FORM */}
          {showForm && (
            <div className="form-card glass-card">
              <h2>Create New Quiz</h2>
              <form onSubmit={handleSubmit} className="quiz-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Quiz Title</label>
                    <input
                      type="text"
                      name="title"
                      className="input-field"
                      placeholder="Enter quiz title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      name="duration_minutes"
                      className="input-field"
                      value={formData.duration_minutes}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    className="input-field"
                    placeholder="Enter quiz description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Passing Score (%)</label>
                    <input
                      type="number"
                      name="passing_score"
                      className="input-field"
                      min="0"
                      max="100"
                      value={formData.passing_score}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category_id"
                      className="select-field"
                      value={formData.category_id}
                      onChange={handleInputChange}
                    >
                      <option value="1">General</option>
                      <option value="2">Science</option>
                      <option value="3">Mathematics</option>
                      <option value="4">History</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="primary-btn">
                  Create Quiz
                </button>
              </form>
            </div>
          )}

          {/* QUIZZES LIST */}
          {quizzes.length > 0 ? (
            <div className="quizzes-list">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-mgmt-card glass-card">
                  <div className="quiz-header">
                    <div>
                      <h3>{quiz.title}</h3>
                      <p className="muted">{quiz.description}</p>
                    </div>
                    <span className={`status-badge ${quiz.status?.toLowerCase() || "draft"}`}>
                      {quiz.status || "DRAFT"}
                    </span>
                  </div>

                  <div className="quiz-details">
                    <div className="detail">
                      <span className="detail-label">Questions:</span>
                      <span>{quiz.total_questions || 0}</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">Duration:</span>
                      <span>{quiz.duration_minutes} min</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">Pass Score:</span>
                      <span>{quiz.passing_score}%</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">Attempts:</span>
                      <span>{quiz.total_attempts || 0}</span>
                    </div>
                  </div>

                  <div className="quiz-actions">
                    <button
                      className="secondary-btn"
                      onClick={() => navigate(`/admin/questions/${quiz.id}`)}
                    >
                      Manage Questions
                    </button>
                    {quiz.status !== "PUBLISHED" && (
                      <button
                        className="primary-btn"
                        onClick={() => handlePublishQuiz(quiz.id)}
                      >
                        Publish
                      </button>
                    )}
                    <button
                      className="danger-btn"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-card">
              <p className="empty-icon">📭</p>
              <p>No quizzes created yet</p>
              <button
                className="primary-btn"
                onClick={() => setShowForm(true)}
              >
                Create Your First Quiz
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}