import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";
import "./Studentquiz.css";

export default function StudentQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    startQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quizStarted || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted]);

  useEffect(() => {
    if (timeLeft === 0 && quizStarted) {
      handleSubmitQuiz();
    }
  }, [timeLeft]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.startQuiz(quizId);

      if (response.data.success) {
        const data = response.data.data;
        setAttemptId(data.attemptId);
        setQuiz({
          title: data.quizTitle,
          durationMinutes: data.durationMinutes
        });
        setQuestions(data.questions);
        setTimeLeft(data.durationMinutes * 60);
        setQuizStarted(true);
        setAnswers({});
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      const formattedAnswers = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] || null
      }));

      const response = await quizAPI.submitQuiz(quizId, {
        attemptId,
        answers: formattedAnswers
      });

      if (response.data.success) {
        navigate(`/result/${attemptId}`);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="container">
          <div className="error-state glass-card">
            <p>{error || "Quiz not found"}</p>
            <button className="primary-btn" onClick={() => navigate("/quizzes")}>
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isAnswered = answers[question.id] !== undefined;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="quiz-page">
      <div className="orb one"></div>
      <div className="orb two"></div>

      {/* QUIZ HEADER */}
      <div className="quiz-header-bar">
        <div className="container header-content">
          <div className="quiz-title-section">
            <h1>{quiz.title}</h1>
          </div>
          <div className="quiz-timer">
            <span className={timeLeft < 300 ? "warning" : ""}>
              ⏱️ {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="progress-section">
        <div className="container">
          <div className="progress-info">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* QUIZ CONTENT */}
      <main className="quiz-content">
        <div className="container">
          <div className="quiz-container">
            {/* QUESTION PANEL */}
            <div className="question-panel glass-card">
              <div className="question-header">
                <h2>{question.question_text}</h2>
                <span className="marks-badge">{question.marks} mark{question.marks !== 1 ? 's' : ''}</span>
              </div>

              {/* OPTIONS */}
              <div className="options-container">
                {question.options?.map((option) => (
                  <button
                    key={option.id}
                    className={`option-button ${
                      answers[question.id] === option.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectOption(question.id, option.id)}
                  >
                    <span className="option-radio"></span>
                    <span className="option-text">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="quiz-sidebar">
              {/* QUESTION NAVIGATOR */}
              <div className="navigator glass-card">
                <h3>Questions</h3>
                <div className="question-grid">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      className={`question-nav-btn ${
                        index === currentQuestion ? "active" : ""
                      } ${answers[q.id] !== undefined ? "answered" : ""}`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* STATS */}
              <div className="stats-info glass-card">
                <div className="stat-row">
                  <span>Answered:</span>
                  <strong>{Object.keys(answers).length}</strong>
                </div>
                <div className="stat-row">
                  <span>Remaining:</span>
                  <strong>{questions.length - Object.keys(answers).length}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* NAVIGATION BUTTONS */}
          <div className="quiz-navigation">
            <button
              className="secondary-btn"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                className="primary-btn danger-submit"
                onClick={handleSubmitQuiz}
              >
                Submit Quiz ✓
              </button>
            ) : (
              <button
                className="primary-btn"
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}