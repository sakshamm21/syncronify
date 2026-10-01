const crypto = require('node:crypto');
const { Router } = require('express');
const env = require('../../config/env');
const { forbidden, notFound } = require('../../lib/errors');
const { sendDueReminders } = require('../../jobs/eventReminders');

const router = Router();

/** Scheduled jobs are triggered by Vercel Cron, which sends `Authorization: Bearer $CRON_SECRET`. */
function requireCronSecret(req, _res, next) {
  if (!env.cronSecret) throw notFound('Scheduled jobs are not enabled', 'JOBS_DISABLED');
  const expected = Buffer.from(`Bearer ${env.cronSecret}`);
  const actual = Buffer.from(req.get('authorization') || '');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) throw forbidden();
  next();
}

router.get('/event-reminders', requireCronSecret, async (_req, res) => {
  res.json({ data: { sent: await sendDueReminders() } });
});

module.exports = router;
