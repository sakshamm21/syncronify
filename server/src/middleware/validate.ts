import type { Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';
import { badRequest } from '../lib/errors';

type Location = 'params' | 'query' | 'body';
type Schemas = Partial<Record<Location, z.ZodType>>;
type Output<S, Fallback> = S extends z.ZodType ? z.output<S> : Fallback;

/** A request whose params, query and body have already been parsed by the given schemas. */
export type ValidatedRequest<S extends Schemas> = Request<
  Output<S['params'], Record<string, string>>,
  unknown,
  Output<S['body'], unknown>,
  Output<S['query'], Record<string, unknown>>
>;

function formatIssues(error: z.ZodError, location: Location) {
  return error.issues.map((issue) => ({
    field: [location, ...issue.path.map(String)].join('.'),
    message: issue.message,
  }));
}

/**
 * Validates and coerces `req.params`, `req.query` and `req.body` against zod
 * schemas, then runs the handler. Inside the handler those values are the
 * parsed, typed results, e.g. `?page=2` arrives as the number 2.
 *
 *   router.get('/', validate({ query: listQuery }, async (req, res) => { req.query.page ... }))
 */
export default function validate<S extends Schemas>(
  schemas: S,
  handler: (req: ValidatedRequest<S>, res: Response) => unknown
): RequestHandler {
  return async (req, res) => {
    const issues: { field: string; message: string }[] = [];

    for (const location of ['params', 'query', 'body'] as const) {
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
    await handler(req as unknown as ValidatedRequest<S>, res);
  };
}
