import http from 'node:http';
import env from './config/env';
import logger from './lib/logger';
import { connectDatabase, disconnectDatabase } from './config/db';
import { createApp } from './app';
import { createSocketServer } from './sockets';
import { startEventReminders } from './jobs/eventReminders';

export async function start(): Promise<void> {
  if (env.usingDevJwtSecret) logger.warn('JWT_SECRET is not set — using an insecure development secret');
  if (!env.mail.enabled) logger.warn('Email is not configured — emails will be logged instead of sent');
  if (!env.ai.enabled) logger.warn('AI_API_KEY is not set — the AI assistant is turned off');

  try {
    await connectDatabase(env.dbUri);
  } catch (err) {
    logger.fatal(
      { err: (err as Error).message },
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

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'Shutting down');
    stopJobs();
    void io.close();
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

if (require.main === module) void start();
