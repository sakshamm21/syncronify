import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import env from '../config/env';

const tooManyRequests = (message: string) => ({
  error: { code: 'TOO_MANY_REQUESTS', message },
});

/** Brute-force protection for credential and code endpoints. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: tooManyRequests('Too many attempts. Please wait a few minutes and try again.'),
});

/** General ceiling for the whole API. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: tooManyRequests('You are making requests too quickly. Please slow down.'),
});

/**
 * Per-user budget for the AI assistant, so one person can't use up a shared
 * (often free-tier) model quota. Runs after `authenticate`.
 */
export const assistantLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  keyGenerator: (req) => (req.user ? `user:${req.user.id}` : ipKeyGenerator(req.ip ?? '')),
  message: tooManyRequests('You have asked the assistant a lot of questions. Please try again in a few minutes.'),
});
