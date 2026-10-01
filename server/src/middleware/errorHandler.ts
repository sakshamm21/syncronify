import mongoose from 'mongoose';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, notFound } from '../lib/errors';
import env from '../config/env';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
};

/** Fields some libraries attach to their errors (MongoDB driver, body-parser). */
type LibraryError = { code?: unknown; type?: unknown; message?: string };

function normalise(err: unknown): AppError | null {
  if (err instanceof AppError) return err;

  if (err instanceof mongoose.Error.CastError) {
    return new AppError(400, `Invalid ${err.path}`, 'INVALID_ID');
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return new AppError(400, details[0]?.message || 'Invalid data', 'VALIDATION_ERROR', details);
  }
  const libraryError = (err ?? {}) as LibraryError;
  if (libraryError.code === 11000) {
    return new AppError(409, 'That record already exists', 'DUPLICATE');
  }
  // Malformed JSON body from express.json().
  if (libraryError.type === 'entity.parse.failed') {
    return new AppError(400, 'Request body is not valid JSON', 'INVALID_JSON');
  }
  if (libraryError.type === 'entity.too.large') {
    return new AppError(413, 'Request body is too large', 'PAYLOAD_TOO_LARGE');
  }
  return null;
}

// Express recognises error handlers by their four-argument signature.
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const known = normalise(err);

  if (!known) {
    req.log?.error({ err }, 'Unhandled error');
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong on our side. Please try again.',
        ...(env.isProduction ? {} : { debug: (err as LibraryError | undefined)?.message }),
      },
    });
    return;
  }

  if (known.statusCode >= 500) req.log?.error({ err }, known.message);

  res.status(known.statusCode).json({
    error: {
      code: known.code,
      message: known.message,
      ...(known.details ? { details: known.details } : {}),
    },
  });
};
