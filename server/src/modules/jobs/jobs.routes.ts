import crypto from 'node:crypto';
import { Router, type RequestHandler } from 'express';
import env from '../../config/env';
import { forbidden, notFound } from '../../lib/errors';
import { sendDueReminders } from '../../jobs/eventReminders';

const router = Router();

/** Scheduled jobs are triggered by Vercel Cron, which sends `Authorization: Bearer $CRON_SECRET`. */
const requireCronSecret: RequestHandler = (req, _res, next) => {
  if (!env.cronSecret) throw notFound('Scheduled jobs are not enabled', 'JOBS_DISABLED');
  const expected = Buffer.from(`Bearer ${env.cronSecret}`);
  const actual = Buffer.from(req.get('authorization') || '');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) throw forbidden();
  next();
};

router.get('/event-reminders', requireCronSecret, async (_req, res) => {
  res.json({ data: { sent: await sendDueReminders() } });
});

export default router;
