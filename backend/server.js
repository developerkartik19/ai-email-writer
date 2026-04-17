// =============================================================
// backend/server.js
// Main Express server — entry point for the backend
// =============================================================

require("dotenv").config(); // Load .env variables FIRST

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const emailRoutes = require("./routes/emailRoutes");
const { emailGenerationLimiter } = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================
// Security Middleware
// =============================================================

// Helmet sets secure HTTP headers
app.use(helmet());

// CORS — allow requests from your frontend only
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In production, block unknown origins
      if (process.env.NODE_ENV === "production") {
        return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
      }
      // In development, allow all origins
      return callback(null, true);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// =============================================================
// Body Parsing
// =============================================================
app.use(express.json({ limit: "10kb" })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// =============================================================
// Validate API Key on Startup
// =============================================================
if (!process.env.GEMINI_API_KEY) {
  console.error("\n❌ ERROR: GEMINI_API_KEY is not set in your .env file!");
  console.error("   Please add your Gemini API key to .env\n");
  process.exit(1);
}

// =============================================================
// Routes
// =============================================================

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🤖 AI Email Writer API",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      generateEmail: "POST /api/generate-email",
    },
  });
});

// Apply rate limiter only to the generate-email route
app.use("/api", emailGenerationLimiter);
app.use("/api", emailRoutes);

// =============================================================
// 404 Handler (must come AFTER all routes)
// =============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found.`,
  });
});

// =============================================================
// Global Error Handler
// =============================================================
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "An unexpected server error occurred.",
  });
});

// =============================================================
// Start Server
// =============================================================
app.listen(PORT, () => {
  console.log("\n🚀 AI Email Writer Backend running!");
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Mode:    ${process.env.NODE_ENV || "development"}`);
  console.log(`   API Key: ${process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ Missing"}\n`);
});

module.exports = app;
