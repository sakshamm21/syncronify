const pino = require('pino');
const env = require('../config/env');

function prettyTransport() {
  if (env.isProduction || env.isTest) return undefined;
  try {
    require.resolve('pino-pretty');
    return { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } };
  } catch {
    return undefined;
  }
}

const logger = pino({
  level: env.logLevel,
  transport: prettyTransport(),
  redact: ['req.headers.authorization', '*.password', '*.otp', '*.token'],
});

module.exports = logger;
