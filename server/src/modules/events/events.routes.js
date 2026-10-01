const { Router } = require('express');
const { authenticate, optionalAuth } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z, idParams } = require('../../lib/schemas');
const { REGISTRATION_STATUS } = require('../../constants');
const schemas = require('./events.schemas');
const events = require('./events.service');
const registrations = require('./registrations.service');
const chat = require('../chat/chat.service');

const router = Router();

// --- Discovery -------------------------------------------------------------

router.get('/', optionalAuth, validate({ query: schemas.list }), async (req, res) => {
  const { items, meta } = await events.listPublic(req.user, req.query);
  res.json({ data: items, meta });
});

router.get('/venues', async (_req, res) => {
  res.json({ data: await events.venueDirectory() });
});

router.get('/recommended', authenticate, async (req, res) => {
  res.json({ data: await events.recommendedFor(req.user) });
});

router.get('/:id', optionalAuth, validate({ params: idParams }), async (req, res) => {
  res.json({ data: await events.getForViewer(req.user, req.params.id) });
});

router.get('/:id/calendar.ics', optionalAuth, validate({ params: idParams }), async (req, res) => {
  const { filename, content } = await events.toCalendarFile(req.user, req.params.id);
  res.type('text/calendar').attachment(filename).send(content);
});

// --- Management ------------------------------------------------------------

router.post('/', authenticate, validate({ body: schemas.create }), async (req, res) => {
  res.status(201).json({ data: await events.create(req.user, req.body) });
});

router.patch('/:id', authenticate, validate({ params: idParams, body: schemas.update }), async (req, res) => {
  res.json({ data: await events.update(req.user, req.params.id, req.body) });
});

router.post('/:id/cancel', authenticate, validate({ params: idParams, body: schemas.cancel }), async (req, res) => {
  res.json({ data: await events.cancel(req.user, req.params.id, req.body) });
});

router.delete('/:id', authenticate, validate({ params: idParams }), async (req, res) => {
  await events.remove(req.user, req.params.id);
  res.status(204).end();
});

// --- Registration ----------------------------------------------------------

router.post('/:id/registration', authenticate, validate({ params: idParams }), async (req, res) => {
  res.json({ data: await registrations.register(req.user, req.params.id) });
});

router.delete('/:id/registration', authenticate, validate({ params: idParams }), async (req, res) => {
  res.json({ data: await registrations.unregister(req.user, req.params.id) });
});

const attendeesQuery = z.object({ status: z.enum(Object.values(REGISTRATION_STATUS)).optional() });

router.get(
  '/:id/attendees',
  authenticate,
  validate({ params: idParams, query: attendeesQuery }),
  async (req, res) => {
    res.json({ data: await registrations.listForEvent(req.user, req.params.id, req.query) });
  }
);

router.put(
  '/:id/attendees/:userId/check-in',
  authenticate,
  validate({ params: schemas.registrationParams, body: schemas.checkIn }),
  async (req, res) => {
    const { id, userId } = req.params;
    res.json({ data: await registrations.setCheckIn(req.user, id, userId, req.body.checkedIn) });
  }
);

// --- Discussion ------------------------------------------------------------

const messagesQuery = z.object({
  before: z.coerce.date().optional(),
  after: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const messageBody = z.object({
  text: z.string().trim().min(1, 'Message cannot be empty').max(2000),
  announcement: z.boolean().default(false),
});

router.get('/:id/messages', authenticate, validate({ params: idParams, query: messagesQuery }), async (req, res) => {
  const { items, hasMore } = await chat.listMessages(req.user, req.params.id, req.query);
  res.json({ data: items, meta: { hasMore } });
});

router.post('/:id/messages', authenticate, validate({ params: idParams, body: messageBody }), async (req, res) => {
  res.status(201).json({ data: await chat.postMessage(req.user, req.params.id, req.body) });
});

module.exports = router;
