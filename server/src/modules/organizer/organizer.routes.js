const { Router } = require('express');
const { authenticate, requireRole } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('../../lib/schemas');
const { ROLES } = require('../../constants');
const service = require('./organizer.service');

const router = Router();
router.use(authenticate);

const applicationBody = z.object({
  organization: z.string().trim().min(2, 'Tell us which organisation or club you represent').max(120),
  reason: z.string().trim().max(1000).default(''),
});

router.post('/applications', validate({ body: applicationBody }), async (req, res) => {
  res.status(201).json({ data: await service.apply(req.user, req.body) });
});

router.get('/applications/latest', async (req, res) => {
  res.json({ data: await service.latestApplication(req.user) });
});

router.get('/overview', requireRole(ROLES.ORGANIZER, ROLES.ADMIN), async (req, res) => {
  res.json({ data: await service.overview(req.user) });
});

module.exports = router;
