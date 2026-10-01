const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z, idParams, pagination, queryBoolean } = require('../../lib/schemas');
const service = require('./notifications.service');

const router = Router();
router.use(authenticate);

const listQuery = z.object({ ...pagination, unreadOnly: queryBoolean.default(false) });

router.get('/', validate({ query: listQuery }), async (req, res) => {
  const { items, meta } = await service.list(req.user, req.query);
  res.json({ data: items, meta });
});

router.post('/read-all', async (req, res) => {
  res.json({ data: await service.markAllRead(req.user) });
});

router.post('/:id/read', validate({ params: idParams }), async (req, res) => {
  res.json({ data: await service.markRead(req.user, req.params.id) });
});

module.exports = router;
