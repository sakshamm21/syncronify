/**
 * Vercel serverless entry point. All routes are rewritten here (see vercel.json).
 * Long-running hosts (local, Docker, Render) use src/server.js instead, which
 * also runs Socket.io and the reminder timer.
 */
const env = require('../src/config/env');
const logger = require('../src/lib/logger');
const { connectDatabase } = require('../src/config/db');
const { createApp } = require('../src/app');

const app = createApp();

module.exports = async function handler(req, res) {
  try {
    await connectDatabase(env.dbUri);
  } catch (err) {
    logger.error({ err: err.message }, 'Database unavailable');
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: { code: 'DATABASE_UNAVAILABLE', message: 'Service temporarily unavailable. Please try again shortly.' } }));
    return;
  }
  return app(req, res);
};
