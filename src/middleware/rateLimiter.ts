import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * Protects the API from abuse and DDoS attacks by limiting request frequency
 */

// General API rate limiter - applies to all API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests to allow legitimate users to make more requests
  skipSuccessfulRequests: false,
});

// Strict rate limiter for authentication endpoints (login, register, etc.)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests so users can make multiple successful logins
  skipSuccessfulRequests: true,
});

// AI endpoints rate limiter (expensive operations that consume API credits)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 AI requests per minute
  message: 'Too many AI requests, please slow down and try again in a minute.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload endpoints rate limiter (to prevent file upload abuse)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 uploads per minute
  message: 'Too many file uploads, please try again in a minute.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset rate limiter (prevent abuse of password reset functionality)
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
