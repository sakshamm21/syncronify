const { User } = require('../models');
const { verifyAccessToken } = require('../lib/tokens');
const { unauthenticated, forbidden } = require('../lib/errors');
const { USER_STATUS } = require('../constants');

function readBearerToken(req) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

/**
 * Resolves a token to an active user. Throws AppError for any reason the
 * token cannot be used. Shared by HTTP middleware and the socket server.
 */
async function resolveUserFromToken(token) {
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw unauthenticated('Your session has expired. Please sign in again.', 'INVALID_TOKEN');
  }

  const user = await User.findById(payload.sub).select('+passwordChangedAt');
  if (!user) throw unauthenticated('This account no longer exists.', 'INVALID_TOKEN');
  if (user.tokenIssuedBeforePasswordChange(payload.iat)) {
    throw unauthenticated('Your password was changed. Please sign in again.', 'INVALID_TOKEN');
  }
  if (user.status === USER_STATUS.SUSPENDED) {
    throw forbidden('This account has been suspended.', 'ACCOUNT_SUSPENDED');
  }
  return user;
}

/** Requires a valid token; sets `req.user`. */
async function authenticate(req, _res, next) {
  const token = readBearerToken(req);
  if (!token) throw unauthenticated();
  req.user = await resolveUserFromToken(token);
  next();
}

/** Sets `req.user` when a valid token is present, otherwise continues anonymously. */
async function optionalAuth(req, _res, next) {
  const token = readBearerToken(req);
  if (token) {
    try {
      req.user = await resolveUserFromToken(token);
    } catch {
      req.user = undefined;
    }
  }
  next();
}

/** Must run after `authenticate`. */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };
}

module.exports = { authenticate, optionalAuth, requireRole, resolveUserFromToken };
