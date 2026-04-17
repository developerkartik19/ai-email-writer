// =============================================================
// middleware/rateLimiter.js
// Prevents API abuse with request rate limiting
// =============================================================

const rateLimit = require("express-rate-limit");

const emailGenerationLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute window
  max: 10,                    // Max 10 requests per minute per IP
  standardHeaders: true,      // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please wait a moment before generating another email.",
  },
});

module.exports = { emailGenerationLimiter };
