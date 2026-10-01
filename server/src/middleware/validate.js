const { badRequest } = require('../lib/errors');

function formatIssues(error, location) {
  return error.issues.map((issue) => ({
    field: [location, ...issue.path].join('.'),
    message: issue.message,
  }));
}

/**
 * Validates and coerces `req.body`, `req.query` and `req.params` against zod
 * schemas. Handlers then read already-parsed values from the same places.
 */
function validate(schemas) {
  return (req, _res, next) => {
    const issues = [];

    for (const location of ['params', 'query', 'body']) {
      const schema = schemas[location];
      if (!schema) continue;

      const result = schema.safeParse(req[location] ?? {});
      if (!result.success) {
        issues.push(...formatIssues(result.error, location));
        continue;
      }
      // Express 5 exposes `req.query` as a getter, so shadow it with an own property.
      Object.defineProperty(req, location, { value: result.data, writable: true, enumerable: true });
    }

    if (issues.length) {
      throw badRequest(issues[0].message, 'VALIDATION_ERROR', issues);
    }
    next();
  };
}

module.exports = validate;
