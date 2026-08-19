import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { questionAPI, quizAPI } from "../services/api";
import "./QuestionManagement.css";

export default function QuestionManagement() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    question_text: "",
    marks: 1,
    options: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false }
    ]
  });

  useEffect(() => {
    loadQuestions();
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const response = await quizAPI.getQuizDetails(quizId);
      if (response.data.success) {
        setQuiz(response.data.data);
      }
    } catch (err) {
      setError("Failed to load quiz details");
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getQuestions(quizId);
      if (response.data.success) {
        setQuestions(response.data.data);
      }
    } catch (err) {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    if (field === "is_correct") {
      newOptions[index].is_correct = value;
    } else {
      newOptions[index].text = value;
    }
    setFormData((prev) => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.options.some((o) => o.is_correct)) {
      setError("Please mark at least one option as correct");
      return;
    }

    try {
      const payload = {
        quiz_id: quizId,
        question_text: formData.question_text,
        marks: parseInt(formData.marks),
        options: formData.options.map((opt) => ({
          text: opt.text,
          is_correct: opt.is_correct
        }))
      };

      const response = await questionAPI.createQuestion(payload);
      if (response.data.success) {
        setFormData({
          question_text: "",
          marks: 1,
          options: [
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: false }
          ]
        });
        setShowForm(false);
        loadQuestions();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create question");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await questionAPI.deleteQuestion(questionId);
      if (response.data.success) {
        loadQuestions();
      }
    } catch (err) {
      setError("Failed to delete question");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="question-management">
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-management">
      <div className="orb one"></div>
      <div className="orb two"></div>

      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="container nav-content">
          <div className="nav-brand">
            <span className="brand-icon">❓</span>
            <span>Question Management</span>
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate("/admin/quizzes")}>
              📋 Back to Quizzes
            </button>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="question-content">
        <div className="container">
          {/* HEADER */}
          <section className="question-header">
            <div>
              <h1 className="section-title">{quiz?.title}</h1>
              <p className="subtitle">
                Manage questions ({questions.length} questions)
              </p>
            </div>
            <button
              className="primary-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "➕ Add Question"}
            </button>
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          {/* ADD QUESTION FORM */}
          {showForm && (
            <div className="form-card glass-card">
              <h2>Add New Question</h2>
              <form onSubmit={handleSubmit} className="question-form">
                <div className="form-group">
                  <label>Question Text</label>
                  <textarea
                    name="question_text"
                    className="input-field"
                    placeholder="Enter question text"
                    value={formData.question_text}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Marks</label>
                  <input
                    type="number"
                    name="marks"
                    className="input-field"
                    min="1"
                    value={formData.marks}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="options-section">
                  <label>Options</label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="option-input">
                      <input
                        type="text"
                        className="input-field"
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          handleOptionChange(index, "text", e.target.value)
                        }
                        required
                      />
                      <label className="correct-checkbox">
                        <input
                          type="checkbox"
                          checked={option.is_correct}
                          onChange={(e) =>
                            handleOptionChange(index, "is_correct", e.target.checked)
                          }
                        />
                        <span>Correct</span>
                      </label>
                    </div>
                  ))}
                </div>

                <button type="submit" className="primary-btn">
                  Add Question
                </button>
              </form>
            </div>
          )}

          {/* QUESTIONS LIST */}
          {questions.length > 0 ? (
            <div className="questions-list">
              {questions.map((question, index) => (
                <div key={question.id} className="question-card glass-card">
                  <div className="question-number">Q{index + 1}</div>
                  <div className="question-body">
                    <h3>{question.question_text}</h3>
                    <p className="marks-info">{question.marks} mark(s)</p>

                    <div className="options-display">
                      {question.options?.map((option) => (
                        <div
                          key={option.id}
                          className={`option-display ${
                            option.is_correct ? "correct" : ""
                          }`}
                        >
                          <span className="option-indicator">
                            {option.is_correct ? "✓" : "○"}
                          </span>
                          <span>{option.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    className="danger-btn"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-card">
              <p className="empty-icon">❓</p>
              <p>No questions added yet</p>
              <button
                className="primary-btn"
                onClick={() => setShowForm(true)}
              >
                Add Your First Question
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}