const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z, password, optionalUrl, queryBoolean } = require('../../lib/schemas');
const { CATEGORY_VALUES } = require('../../constants');
const service = require('./me.service');
const events = require('../events/events.service');
const registrations = require('../events/registrations.service');
const eventSchemas = require('../events/events.schemas');

const router = Router();
router.use(authenticate);

const profileBody = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    bio: z.string().trim().max(500),
    avatarUrl: optionalUrl,
    interests: z.array(z.enum(CATEGORY_VALUES)).max(CATEGORY_VALUES.length),
    preferences: z.object({ emailNotifications: z.boolean() }).partial(),
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'Nothing to update');

const passwordBody = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: password,
});

router.get('/', (req, res) => {
  res.json({ data: req.user });
});

router.patch('/', validate({ body: profileBody }), async (req, res) => {
  res.json({ data: await service.updateProfile(req.user, req.body) });
});

router.post('/password', validate({ body: passwordBody }), async (req, res) => {
  res.json({ data: await service.changePassword(req.user, req.body) });
});

router.get('/calendar', validate({ query: eventSchemas.calendarRange }), async (req, res) => {
  res.json({ data: await events.calendarFor(req.user, req.query) });
});

const registrationsQuery = z.object({ upcoming: queryBoolean.default(true) });

router.get('/registrations', validate({ query: registrationsQuery }), async (req, res) => {
  res.json({ data: await registrations.listForUser(req.user, { upcomingOnly: req.query.upcoming }) });
});

module.exports = router;
