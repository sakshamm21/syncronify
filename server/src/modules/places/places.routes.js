const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('../../lib/schemas');
const service = require('./places.service');

const router = Router();

const searchQuery = z.object({
  q: z.string().trim().min(3, 'Type at least 3 characters').max(120),
});

// Signed-in only: it proxies a shared free service, so keep it off the open internet.
router.get('/search', authenticate, validate({ query: searchQuery }), async (req, res) => {
  res.json({ data: await service.search(req.query.q) });
});

module.exports = router;
