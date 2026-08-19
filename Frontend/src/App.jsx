import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";

// Pages
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import AdminLogin from "./Pages/AdminLogin";
import StudentDashboard from "./Pages/StudentDashboard";
import StudentQuizList from "./Pages/StudentQuizLisr";
import StudentQuiz from "./Pages/studentQuiz";
import QuizResult from "./Pages/QuizResult";
import AttemptHistory from "./Pages/AttemptHistory";
import AdminDashboard from "./Pages/AdminDashboard";
import QuizManagement from "./Pages/QuizManagement";
import QuestionManagement from "./Pages/QuestionManagement";

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* ===== STUDENT ROUTES ===== */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentQuizList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result/:attemptId"
            element={
              <ProtectedRoute role="STUDENT">
                <QuizResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attempts"
            element={
              <ProtectedRoute role="STUDENT">
                <AttemptHistory />
              </ProtectedRoute>
            }
          />

          {/* ===== ADMIN ROUTES ===== */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <ProtectedRoute role="ADMIN">
                <QuizManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/questions/:quizId"
            element={
              <ProtectedRoute role="ADMIN">
                <QuestionManagement />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;