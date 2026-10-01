const { z } = require('zod');

/** "startsAt" -> "Starts at" */
const humanize = (key) => {
  const words = String(key).replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

// Friendly default for missing fields: "Title is required" instead of
// "Invalid input: expected string, received undefined".
z.config({
  customError: (issue) => {
    if (issue.code !== 'invalid_type' || issue.input !== undefined) return undefined;
    const field = issue.path?.at(-1);
    return typeof field === 'string' ? `${humanize(field)} is required` : 'This field is required';
  },
});

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const idParams = z.object({ id: objectId });

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Enter a valid email address' }));

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
};

/** Query-string booleans arrive as strings. */
const queryBoolean = z.enum(['true', 'false']).transform((v) => v === 'true');

/** Optional URL that also accepts an empty string (to clear the field). */
const optionalUrl = z.union([z.literal(''), z.url({ error: 'Enter a valid URL' })]);

function paginationMeta({ page, limit }, total) {
  return { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) };
}

/** Escapes user input for use inside a RegExp. */
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { z, objectId, idParams, email, password, pagination, queryBoolean, optionalUrl, paginationMeta, escapeRegex };
