import { Router } from 'express';
import { authenticate, currentUser, requireRole } from '../../middleware/auth';
import validate from '../../middleware/validate';
import { z } from '../../lib/schemas';
import { ROLES } from '../../constants';
import * as service from './organizer.service';

const router = Router();
router.use(authenticate);

const applicationBody = z.object({
  organization: z.string().trim().min(2, 'Tell us which organisation or club you represent').max(120),
  reason: z.string().trim().max(1000).default(''),
});

router.post('/applications', validate({ body: applicationBody }, async (req, res) => {
  res.status(201).json({ data: await service.apply(currentUser(req), req.body) });
}));

router.get('/applications/latest', async (req, res) => {
  res.json({ data: await service.latestApplication(currentUser(req)) });
});

router.get('/overview', requireRole(ROLES.ORGANIZER, ROLES.ADMIN), async (req, res) => {
  res.json({ data: await service.overview(currentUser(req)) });
});

export default router;
