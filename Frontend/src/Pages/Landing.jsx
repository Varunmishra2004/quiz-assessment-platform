import { useNavigate } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  const handleStudentClick = () => {
    if (token && userRole === "STUDENT") {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleAdminClick = () => {
    if (token && userRole === "ADMIN") {
      navigate("/admin/dashboard");
    } else {
      navigate("/admin-login");
    }
  };

  return (
    <div className="landing-page">
      <div className="orb one"></div>
      <div className="orb two"></div>

      {/* HEADER */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">📚</span>
              <span className="logo-text">QuizMaster</span>
            </div>
            <nav className="nav-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#contact">Contact</a>
            </nav>
            <div className="header-actions">
              <button className="secondary-btn" onClick={handleStudentClick}>
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-copy">
              <div className="hero-badge">
                <span>✨</span>
                <span>Modern Quiz Platform</span>
              </div>
              <h1>Master Learning With Interactive Quizzes</h1>
              <p>
                Take engaging quizzes, track your progress, and compete on the leaderboard.
                Our platform makes assessment fun and effective.
              </p>
              <div className="cta-row">
                <button className="primary-btn" onClick={handleStudentClick}>
                  Start as Student
                </button>
                <button className="secondary-btn" onClick={() => navigate("/signup")}>
                  Sign Up
                </button>
              </div>
            </div>

            <div className="hero-visual">
              <div className="preview-card glass-card">
                <div className="preview-box">
                  <div className="preview-grid">
                    <div className="preview-item"></div>
                    <div className="preview-item"></div>
                    <div className="preview-item"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose QuizMaster?</h2>
          <div className="features-grid">
            <div className="feature-card glass-card">
              <div className="feature-icon">🎯</div>
              <h3>Interactive Quizzes</h3>
              <p>Engage with dynamic questions designed to test your knowledge effectively.</p>
            </div>
            <div className="feature-card glass-card">
              <div className="feature-icon">📊</div>
              <h3>Real-Time Analytics</h3>
              <p>Track your progress with detailed analytics and performance metrics.</p>
            </div>
            <div className="feature-card glass-card">
              <div className="feature-icon">🏆</div>
              <h3>Leaderboard</h3>
              <p>Compete with peers and climb the global leaderboard rankings.</p>
            </div>
            <div className="feature-card glass-card">
              <div className="feature-icon">⏱️</div>
              <h3>Timed Assessments</h3>
              <p>Challenge yourself with time-limited quizzes to improve speed and accuracy.</p>
            </div>
            <div className="feature-card glass-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Take quizzes anytime, anywhere on any device.</p>
            </div>
            <div className="feature-card glass-card">
              <div className="feature-icon">🔐</div>
              <h3>Secure & Reliable</h3>
              <p>Your data is protected with enterprise-grade security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your account in seconds</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Browse Quizzes</h3>
              <p>Explore quizzes across different categories</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Take Quiz</h3>
              <p>Answer questions within the time limit</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>View Results</h3>
              <p>See your score and review answers</p>
            </div>
          </div>
        </div>
      </section>

      {/* ADMIN SECTION */}
      <section className="admin-section">
        <div className="container">
          <div className="admin-content">
            <div className="admin-copy">
              <h2 className="section-title">For Administrators</h2>
              <p>
                Create and manage quizzes, track student performance, and get detailed
                analytics. Full control over your assessment platform.
              </p>
              <button className="primary-btn" onClick={handleAdminClick}>
                Admin Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2024 QuizMaster. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}