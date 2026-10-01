const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

/** Throws a jsonwebtoken error if the token is invalid or expired. */
function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

/** Six-digit numeric one-time code. */
function generateOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/** Opaque URL-safe token for links sent by email (password reset). */
function generateUrlToken() {
  return crypto.randomBytes(32).toString('hex');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = { signAccessToken, verifyAccessToken, generateOtp, generateUrlToken, sha256 };
