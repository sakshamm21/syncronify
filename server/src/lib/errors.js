/**
 * An expected, client-facing error. Anything else that reaches the error
 * handler is treated as an unexpected 500.
 */
class AppError extends Error {
  constructor(statusCode, message, code, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code || defaultCode(statusCode);
    this.details = details;
  }
}

function defaultCode(statusCode) {
  switch (statusCode) {
    case 400: return 'BAD_REQUEST';
    case 401: return 'UNAUTHENTICATED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 409: return 'CONFLICT';
    case 429: return 'TOO_MANY_REQUESTS';
    default: return 'ERROR';
  }
}

const badRequest = (message, code, details) => new AppError(400, message, code, details);
const unauthenticated = (message = 'Please sign in to continue', code) => new AppError(401, message, code);
const forbidden = (message = 'You do not have permission to do that', code) => new AppError(403, message, code);
const notFound = (message = 'Not found', code) => new AppError(404, message, code);
const conflict = (message, code) => new AppError(409, message, code);

module.exports = { AppError, badRequest, unauthenticated, forbidden, notFound, conflict };
