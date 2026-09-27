import rateLimit from 'express-rate-limit'

/** Login / OAuth — blunt credential stuffing and token spam. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Try again later.', errors: [] },
})

/** View pings — limit anonId rotation abuse. */
export const viewRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many view requests. Slow down.', errors: [] },
})

/** Review writes. */
export const reviewWriteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many review submissions. Try again later.', errors: [] },
})

/** Admin multipart uploads. */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many uploads. Try again later.', errors: [] },
})
