// =============================================================
// routes/emailRoutes.js
// Defines API routes for email generation
// =============================================================

const express = require("express");
const router = express.Router();
const { generateEmail } = require("../controllers/emailController");

// POST /api/generate-email
// Body: { purpose, recipientType, tone, keyPoints?, senderName? }
router.post("/generate-email", generateEmail);

// GET /api/health
// Simple health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Email Writer API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
