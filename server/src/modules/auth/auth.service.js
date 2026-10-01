const crypto = require('node:crypto');
const { User } = require('../../models');
const env = require('../../config/env');
const { AppError, badRequest, conflict, forbidden, unauthenticated } = require('../../lib/errors');
const { signAccessToken, generateOtp, generateUrlToken, sha256 } = require('../../lib/tokens');
const { sendMail } = require('../../lib/mailer');
const emails = require('../../lib/emailTemplates');
const { USER_STATUS } = require('../../constants');

const CODE_TTL_MINUTES = 10;
const CODE_MAX_ATTEMPTS = 5;
const CODE_RESEND_COOLDOWN_SECONDS = 30;
const RESET_TTL_MINUTES = 30;

function createSession(user) {
  return { token: signAccessToken(user), user: user.toJSON() };
}

/**
 * Without working email the code cannot reach an inbox, so it is returned to
 * the client instead. Never in production unless EXPOSE_VERIFICATION_CODES is set.
 */
const devOnly = (delivered, value) => (!delivered && env.exposeVerificationCodes ? value : undefined);

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function sendVerificationCode(user) {
  const lastSent = user.emailVerification?.sentAt;
  if (lastSent) {
    const secondsSince = (Date.now() - lastSent.getTime()) / 1000;
    if (secondsSince < CODE_RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(CODE_RESEND_COOLDOWN_SECONDS - secondsSince);
      throw new AppError(429, `Please wait ${wait}s before requesting another code.`, 'RESEND_COOLDOWN', { retryAfter: wait });
    }
  }

  const code = generateOtp();
  user.emailVerification = {
    codeHash: sha256(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    attempts: 0,
    sentAt: new Date(),
  };
  await user.save();

  const delivered = await sendMail({
    to: user.email,
    ...emails.verificationCode({ name: user.name, otp: code, expiresInMinutes: CODE_TTL_MINUTES }),
  });
  return { delivered, code };
}

async function register({ name, email, password }) {
  let user = await User.findOne({ email }).select('+emailVerification');

  if (user?.emailVerified) {
    throw conflict('An account with this email already exists. Try signing in instead.', 'EMAIL_TAKEN');
  }

  // An unverified account can be re-registered: the latest details win.
  if (!user) user = new User({ email });
  user.name = name;
  await user.setPassword(password);

  const { delivered, code } = await sendVerificationCode(user);
  return { email: user.email, emailDelivered: delivered, devCode: devOnly(delivered, code) };
}

async function resendVerification({ email }) {
  const user = await User.findOne({ email }).select('+emailVerification');
  // Same response for unknown or already verified emails, so this endpoint
  // cannot be used to discover which addresses have accounts.
  if (!user || user.emailVerified) return { email };

  const { delivered, code } = await sendVerificationCode(user);
  return { email, emailDelivered: delivered, devCode: devOnly(delivered, code) };
}

async function verifyEmail({ email, code }) {
  const user = await User.findOne({ email }).select('+emailVerification');
  if (!user) throw badRequest('That code is not valid.', 'INVALID_CODE');
  if (user.emailVerified) throw conflict('This email is already verified. Please sign in.', 'ALREADY_VERIFIED');

  const pending = user.emailVerification;
  if (!pending?.codeHash || pending.expiresAt < new Date()) {
    throw badRequest('This code has expired. Request a new one.', 'CODE_EXPIRED');
  }
  if (pending.attempts >= CODE_MAX_ATTEMPTS) {
    throw new AppError(429, 'Too many incorrect attempts. Request a new code.', 'TOO_MANY_ATTEMPTS');
  }

  if (!safeEqual(sha256(code), pending.codeHash)) {
    pending.attempts += 1;
    await user.save();
    const left = CODE_MAX_ATTEMPTS - pending.attempts;
    throw badRequest(
      left > 0 ? `That code is not valid. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many incorrect attempts. Request a new code.',
      'INVALID_CODE'
    );
  }

  user.emailVerified = true;
  user.emailVerification = undefined;
  user.lastLoginAt = new Date();
  await user.save();
  return createSession(user);
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.checkPassword(password))) {
    throw unauthenticated('Incorrect email or password.', 'INVALID_CREDENTIALS');
  }
  if (!user.emailVerified) {
    throw forbidden('Please verify your email to continue.', 'EMAIL_NOT_VERIFIED');
  }
  if (user.status === USER_STATUS.SUSPENDED) {
    throw forbidden('This account has been suspended. Contact an administrator.', 'ACCOUNT_SUSPENDED');
  }

  user.lastLoginAt = new Date();
  await user.save();
  return createSession(user);
}

async function forgotPassword({ email }) {
  const user = await User.findOne({ email });
  if (!user) return {};

  const token = generateUrlToken();
  user.passwordReset = { tokenHash: sha256(token), expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000) };
  await user.save();

  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
  const delivered = await sendMail({
    to: user.email,
    ...emails.passwordReset({ name: user.name, resetUrl, expiresInMinutes: RESET_TTL_MINUTES }),
  });
  return { devResetUrl: devOnly(delivered, resetUrl) };
}

async function resetPassword({ token, password }) {
  const user = await User.findOne({
    'passwordReset.tokenHash': sha256(token),
    'passwordReset.expiresAt': { $gt: new Date() },
  });
  if (!user) throw badRequest('This reset link is invalid or has expired.', 'INVALID_RESET_TOKEN');

  await user.setPassword(password);
  user.passwordChangedAt = new Date();
  user.passwordReset = undefined;
  // Following the emailed link proves ownership of the address.
  user.emailVerified = true;
  user.lastLoginAt = new Date();
  await user.save();
  return createSession(user);
}

module.exports = { createSession, register, resendVerification, verifyEmail, login, forgotPassword, resetPassword };
