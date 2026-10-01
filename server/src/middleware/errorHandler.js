const mongoose = require('mongoose');
const { AppError, notFound } = require('../lib/errors');
const env = require('../config/env');

function notFoundHandler(req, _res, next) {
  next(notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

function normalise(err) {
  if (err instanceof AppError) return err;

  if (err instanceof mongoose.Error.CastError) {
    return new AppError(400, `Invalid ${err.path}`, 'INVALID_ID');
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return new AppError(400, details[0]?.message || 'Invalid data', 'VALIDATION_ERROR', details);
  }
  if (err?.code === 11000) {
    return new AppError(409, 'That record already exists', 'DUPLICATE');
  }
  // Malformed JSON body from express.json().
  if (err?.type === 'entity.parse.failed') {
    return new AppError(400, 'Request body is not valid JSON', 'INVALID_JSON');
  }
  if (err?.type === 'entity.too.large') {
    return new AppError(413, 'Request body is too large', 'PAYLOAD_TOO_LARGE');
  }
  return null;
}

// Express recognises error handlers by their four-argument signature.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const known = normalise(err);

  if (!known) {
    req.log?.error({ err }, 'Unhandled error');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong on our side. Please try again.',
        ...(env.isProduction ? {} : { debug: err?.message }),
      },
    });
  }

  if (known.statusCode >= 500) req.log?.error({ err }, known.message);

  return res.status(known.statusCode).json({
    error: {
      code: known.code,
      message: known.message,
      ...(known.details ? { details: known.details } : {}),
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
