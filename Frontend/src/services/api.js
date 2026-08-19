import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ===== AUTH ENDPOINTS =====
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  signup: (name, email, password) => api.post("/auth/signup", { name, email, password }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
  }
};

// ===== QUIZ ENDPOINTS =====
export const quizAPI = {
  getPublishedQuizzes: () => api.get("/student/quizzes"),
  getQuizDetails: (quizId) => api.get(`/student/quizzes/${quizId}`),
  startQuiz: (quizId) => api.post(`/student/quizzes/${quizId}/start`),
  submitQuiz: (quizId, data) => api.post(`/student/quizzes/${quizId}/submit`, data),
  getAttemptResult: (attemptId) => api.get(`/student/quizzes/attempts/${attemptId}`),
  getAttemptHistory: () => api.get(`/student/quizzes/attempts`),
  getAllQuizzes: () => api.get("/quizzes"),
  createQuiz: (data) => api.post("/quizzes", data),
  updateQuiz: (quizId, data) => api.put(`/quizzes/${quizId}`, data),
  deleteQuiz: (quizId) => api.delete(`/quizzes/${quizId}`),
  publishQuiz: (quizId) => api.put(`/quizzes/${quizId}/status`, { status: "PUBLISHED" })
};

// ===== DASHBOARD ENDPOINTS =====
export const dashboardAPI = {
  getStudentDashboard: () => api.get("/dashboard/student"),
  getAdminAnalytics: () => api.get("/admin/analytics")
};

// ===== LEADERBOARD ENDPOINTS =====
export const leaderboardAPI = {
  getLeaderboard: (categoryId) => 
    api.get(`/leaderboard`, { params: { category_id: categoryId } })
};

// ===== QUESTION ENDPOINTS =====
export const questionAPI = {
  getQuestions: (quizId) => api.get(`/questions?quiz_id=${quizId}`),
  createQuestion: (data) => api.post("/questions", data),
  updateQuestion: (questionId, data) => api.put(`/questions/${questionId}`, data),
  deleteQuestion: (questionId) => api.delete(`/questions/${questionId}`)
};

// ===== CATEGORY ENDPOINTS =====
export const categoryAPI = {
  getCategories: () => api.get("/categories")
};

export default api;