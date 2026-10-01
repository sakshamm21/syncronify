const { rateLimit } = require('express-rate-limit');
const env = require('../config/env');

const tooManyRequests = (message) => ({
  error: { code: 'TOO_MANY_REQUESTS', message },
});

/** Brute-force protection for credential and code endpoints. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: tooManyRequests('Too many attempts. Please wait a few minutes and try again.'),
});

/** General ceiling for the whole API. */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: tooManyRequests('You are making requests too quickly. Please slow down.'),
});

module.exports = { authLimiter, apiLimiter };
