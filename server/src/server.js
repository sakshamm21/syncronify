const http = require('node:http');
const env = require('./config/env');
const logger = require('./lib/logger');
const { connectDatabase, disconnectDatabase } = require('./config/db');
const { createApp } = require('./app');
const { createSocketServer } = require('./sockets');
const { startEventReminders } = require('./jobs/eventReminders');

async function start() {
  if (env.usingDevJwtSecret) logger.warn('JWT_SECRET is not set — using an insecure development secret');
  if (!env.mail.enabled) logger.warn('SMTP is not configured — emails will be logged instead of sent');

  try {
    await connectDatabase(env.dbUri);
  } catch (err) {
    logger.fatal(
      { err: err.message },
      'Could not connect to MongoDB. Check DB_URI, or run `npm run dev:memory` for a throwaway local database.'
    );
    process.exit(1);
  }

  const httpServer = http.createServer(createApp());
  const io = createSocketServer(httpServer);
  const stopJobs = env.enableJobs ? startEventReminders() : () => {};

  httpServer.listen(env.port, () => {
    logger.info(`Syncronify API listening on http://localhost:${env.port}`);
  });

  const shutdown = (signal) => {
    logger.info({ signal }, 'Shutting down');
    stopJobs();
    io.close();
    httpServer.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Don't hang forever on open keep-alive connections.
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

if (require.main === module) start();

module.exports = { start };
