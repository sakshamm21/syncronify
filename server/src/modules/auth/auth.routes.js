const { Router } = require('express');
const validate = require('../../middleware/validate');
const { authLimiter } = require('../../middleware/rateLimit');
const schemas = require('./auth.schemas');
const service = require('./auth.service');

const router = Router();
router.use(authLimiter);

router.post('/register', validate({ body: schemas.register }), async (req, res) => {
  res.status(201).json({ data: await service.register(req.body) });
});

router.post('/verify-email', validate({ body: schemas.verifyEmail }), async (req, res) => {
  res.json({ data: await service.verifyEmail(req.body) });
});

router.post('/resend-verification', validate({ body: schemas.emailOnly }), async (req, res) => {
  res.json({ data: await service.resendVerification(req.body) });
});

router.post('/login', validate({ body: schemas.login }), async (req, res) => {
  res.json({ data: await service.login(req.body) });
});

router.post('/forgot-password', validate({ body: schemas.emailOnly }), async (req, res) => {
  res.json({ data: await service.forgotPassword(req.body) });
});

router.post('/reset-password', validate({ body: schemas.resetPassword }), async (req, res) => {
  res.json({ data: await service.resetPassword(req.body) });
});

module.exports = router;
