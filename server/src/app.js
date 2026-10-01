const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const env = require('./config/env');
const logger = require('./lib/logger');
const { isDatabaseConnected } = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.set('trust proxy', env.trustProxy);
  app.use(helmet());
  app.use(cors({ origin: env.clientOrigins.includes('*') ? true : env.clientOrigins }));
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === '/api/health' },
      customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    const database = isDatabaseConnected() ? 'up' : 'down';
    res.status(database === 'up' ? 200 : 503).json({
      data: { status: database === 'up' ? 'ok' : 'degraded', database, uptime: Math.round(process.uptime()) },
    });
  });

  // Lets the web app adapt to the host: live sockets, or polling on serverless.
  app.get('/api/meta', (_req, res) => {
    res.json({ data: { realtime: env.realtime, emailDelivery: env.mail.enabled } });
  });

  app.use('/api/jobs', require('./modules/jobs/jobs.routes'));
  app.use('/api', apiLimiter);
  app.use('/api/auth', require('./modules/auth/auth.routes'));
  app.use('/api/me', require('./modules/me/me.routes'));
  app.use('/api/events', require('./modules/events/events.routes'));
  app.use('/api/notes', require('./modules/notes/notes.routes'));
  app.use('/api/places', require('./modules/places/places.routes'));
  app.use('/api/notifications', require('./modules/notifications/notifications.routes'));
  app.use('/api/organizer', require('./modules/organizer/organizer.routes'));
  app.use('/api/admin', require('./modules/admin/admin.routes'));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
