import rateLimit from 'express-rate-limit';

const options = (max, windowMs, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, message },
  });

// Strict limit for auth endpoints (brute-force protection)
export const authLimiter = options(
  10,
  15 * 60 * 1000,
  'Too many auth attempts. Please try again after 15 minutes.',
);

// General API limit
export const apiLimiter = options(
  200,
  15 * 60 * 1000,
  'Too many requests. Please slow down.',
);
