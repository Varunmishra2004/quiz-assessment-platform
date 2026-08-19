const { Pool } = require("pg");
require("dotenv").config();

const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) console.warn(`⚠️ Database configuration is incomplete. Missing: ${missing.join(", ")}`);

const db = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || "quiz_platform",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

db.on("connect", () => console.log("✅ Database connected successfully"));
db.on("error", (err) => console.error("❌ PostgreSQL pool error:", err.message));

module.exports = db;
