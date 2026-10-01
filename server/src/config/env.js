const path = require('node:path');
const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const DEV_JWT_SECRET = 'dev-only-insecure-secret-change-me-in-production';

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    DB_URI: z.string().min(1, 'DB_URI is required').optional(),
    JWT_SECRET: z.string().min(1).default(DEV_JWT_SECRET),
    JWT_EXPIRES_IN: z.string().default('7d'),
    // Comma-separated list of allowed browser origins.
    CLIENT_URL: z.string().default('http://localhost:3000'),
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
    // 'socket' for long-running hosts; 'polling' for serverless (Vercel), which can't hold WebSockets.
    REALTIME: z.enum(['socket', 'polling']).default(process.env.VERCEL ? 'polling' : 'socket'),
    // Secret Vercel Cron sends as a bearer token when calling scheduled job endpoints.
    CRON_SECRET: z.string().optional(),
    // Show verification codes / reset links in the API response when email can't be sent.
    // Always on outside production; in production only for demos without SMTP.
    EXPOSE_VERIFICATION_CODES: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    ENABLE_JOBS: z
      .enum(['true', 'false'])
      .default('true')
      .transform((v) => v === 'true'),

    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    MAIL_FROM: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;
    if (!env.DB_URI) {
      ctx.addIssue({ code: 'custom', path: ['DB_URI'], message: 'DB_URI is required in production' });
    }
    if (env.JWT_SECRET === DEV_JWT_SECRET || env.JWT_SECRET.length < 32) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must be set to a random string of at least 32 characters in production',
      });
    }
  });

/** 'https://app-*.vercel.app' -> RegExp, so preview deployments can be allowed. */
function toOriginMatcher(origin) {
  if (!origin.includes('*')) return origin;
  const escape = (part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${origin.split('*').map(escape).join('[a-z0-9-]+')}$`);
}

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  // Logger depends on config, so fall back to stderr here.
  console.error(`Invalid environment configuration:\n${problems}`);
  process.exit(1);
}

const raw = parsed.data;

const env = Object.freeze({
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  port: raw.PORT,
  dbUri: raw.DB_URI,
  jwtSecret: raw.JWT_SECRET,
  jwtExpiresIn: raw.JWT_EXPIRES_IN,
  // Allowed CORS origins: exact strings, or RegExps for entries containing '*'.
  // Outside production any localhost port is allowed, since Next.js picks another port when 3000 is busy.
  clientOrigins: [
    ...raw.CLIENT_URL.split(',').map((o) => o.trim()).filter(Boolean).map(toOriginMatcher),
    ...(raw.NODE_ENV === 'production' ? [] : [/^http:\/\/localhost:\d+$/]),
  ],
  // First origin is used to build links in emails.
  clientUrl: raw.CLIENT_URL.split(',')[0].trim(),
  trustProxy: raw.TRUST_PROXY,
  logLevel: raw.LOG_LEVEL ?? (raw.NODE_ENV === 'test' ? 'silent' : 'info'),
  enableJobs: raw.ENABLE_JOBS && raw.NODE_ENV !== 'test',
  realtime: raw.REALTIME,
  cronSecret: raw.CRON_SECRET,
  exposeVerificationCodes: raw.NODE_ENV !== 'production' || raw.EXPOSE_VERIFICATION_CODES,
  mail: {
    host: raw.SMTP_HOST,
    port: raw.SMTP_PORT,
    user: raw.SMTP_USER,
    password: raw.SMTP_PASSWORD,
    from: raw.MAIL_FROM || raw.SMTP_USER,
    enabled: Boolean(raw.SMTP_HOST && raw.SMTP_USER && raw.SMTP_PASSWORD),
  },
  usingDevJwtSecret: raw.JWT_SECRET === DEV_JWT_SECRET,
});

module.exports = env;
