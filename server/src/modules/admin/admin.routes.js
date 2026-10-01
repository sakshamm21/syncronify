const { Router } = require('express');
const { authenticate, requireRole } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z, idParams, pagination } = require('../../lib/schemas');
const { ROLES, USER_STATUS, ORGANIZER_APPLICATION_STATUS } = require('../../constants');
const service = require('./admin.service');

const router = Router();
router.use(authenticate, requireRole(ROLES.ADMIN));

const usersQuery = z.object({
  q: z.string().trim().max(100).optional(),
  role: z.enum(Object.values(ROLES)).optional(),
  status: z.enum(Object.values(USER_STATUS)).optional(),
  ...pagination,
});

const userUpdateBody = z
  .object({
    role: z.enum(Object.values(ROLES)).optional(),
    status: z.enum(Object.values(USER_STATUS)).optional(),
  })
  .refine((body) => body.role || body.status, 'Provide a role or status');

const applicationsQuery = z.object({
  status: z.enum(Object.values(ORGANIZER_APPLICATION_STATUS)).optional(),
  ...pagination,
});

const reviewBody = z.object({ note: z.string().trim().max(500).default('') });

router.get('/stats', async (_req, res) => {
  res.json({ data: await service.stats() });
});

router.get('/users', validate({ query: usersQuery }), async (req, res) => {
  const { items, meta } = await service.listUsers(req.query);
  res.json({ data: items, meta });
});

router.patch('/users/:id', validate({ params: idParams, body: userUpdateBody }), async (req, res) => {
  res.json({ data: await service.updateUser(req.user, req.params.id, req.body) });
});

router.get('/organizer-applications', validate({ query: applicationsQuery }), async (req, res) => {
  const { items, meta } = await service.listApplications(req.query);
  res.json({ data: items, meta });
});

router.post(
  '/organizer-applications/:id/approve',
  validate({ params: idParams, body: reviewBody }),
  async (req, res) => {
    res.json({ data: await service.reviewApplication(req.user, req.params.id, { approve: true, note: req.body.note }) });
  }
);

router.post(
  '/organizer-applications/:id/reject',
  validate({ params: idParams, body: reviewBody }),
  async (req, res) => {
    res.json({ data: await service.reviewApplication(req.user, req.params.id, { approve: false, note: req.body.note }) });
  }
);

module.exports = router;
