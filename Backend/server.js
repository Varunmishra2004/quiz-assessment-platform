const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.js");
const quizRoutes = require("./routes/quiz.js");
const questionRoutes = require("./routes/question.js");
const dashboardRoutes = require("./routes/dashboard.js");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes.js");
const studentQuizRoutes = require("./routes/studentQuizRoutes.js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminAnalyticsRoutes);
app.use("/api/student/quizzes", studentQuizRoutes);
app.use("/api/student", studentQuizRoutes);

app.get("/api/health", async (req, res) => {
  try {
    const db = require("./config/database.js");
    await db.query("SELECT 1");
    res.json({ success: true, message: "Server and database are running" });
  } catch (error) {
    console.error("❌ Health check database error:", error.message);
    res.status(503).json({ success: false, message: "Server is running but database connection failed" });
  }
});

app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, async () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 API Base: http://localhost:${PORT}/api`);

  const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(", ")}`);
    console.warn("Create Backend/.env using Backend/.env.example before testing login.");
  }

  try {
    const db = require("./config/database.js");
    await db.query("SELECT 1");
    console.log("✅ PostgreSQL connection verified");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    console.error("Check Backend/.env: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME.");
  }
});
