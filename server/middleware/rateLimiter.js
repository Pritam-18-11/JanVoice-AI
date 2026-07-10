import rateLimit from 'express-rate-limit';

// Protects login/register from brute-force / credential-stuffing attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window per IP
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Prevents grievance-submission spam
export const complaintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 submissions per hour per IP
  message: { message: 'Too many complaints submitted. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});