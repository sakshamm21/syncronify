import pino, { type TransportSingleOptions } from 'pino';
import env from '../config/env';

function prettyTransport(): TransportSingleOptions | undefined {
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

export default logger;
