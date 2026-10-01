const { z, objectId, pagination, queryBoolean, optionalUrl } = require('../../lib/schemas');
const { CATEGORY_VALUES, EVENT_VISIBILITY, EVENT_STATUS } = require('../../constants');

const venue = z.object({
  name: z.string().trim().max(160).optional(),
  address: z.string().trim().max(300).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

const fields = {
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(140),
  description: z.string().trim().max(5000),
  category: z.enum(CATEGORY_VALUES),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(10),
  coverImageUrl: optionalUrl,
  startsAt: z.coerce.date({ error: 'Enter a valid start date' }),
  endsAt: z.coerce.date({ error: 'Enter a valid end date' }),
  venue,
  onlineUrl: optionalUrl,
  visibility: z.enum(Object.values(EVENT_VISIBILITY)),
  // Cancelling has its own endpoint so attendees are always notified.
  status: z.enum([EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED]),
  capacity: z.number().int().min(1).max(100_000).nullable(),
};

const endsAfterStart = (e) => !e.startsAt || !e.endsAt || e.endsAt > e.startsAt;
const endsAfterStartMessage = { message: 'The event must end after it starts', path: ['endsAt'] };

const create = z
  .object({
    title: fields.title,
    description: fields.description.default(''),
    category: fields.category.default('other'),
    tags: fields.tags.default([]),
    coverImageUrl: fields.coverImageUrl.optional(),
    startsAt: fields.startsAt,
    endsAt: fields.endsAt,
    venue: fields.venue.optional(),
    onlineUrl: fields.onlineUrl.optional(),
    visibility: fields.visibility.optional(),
    status: fields.status.optional(),
    capacity: fields.capacity.optional(),
  })
  .refine(endsAfterStart, endsAfterStartMessage);

const update = z
  .object(Object.fromEntries(Object.entries(fields).map(([key, schema]) => [key, schema.optional()])))
  .refine((body) => Object.keys(body).length > 0, 'Nothing to update')
  .refine(endsAfterStart, endsAfterStartMessage);

const list = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.enum(CATEGORY_VALUES).optional(),
  organizer: objectId.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sort: z.enum(['soonest', 'popular', 'newest']).default('soonest'),
  includePast: queryBoolean.default(false),
  ...pagination,
});

const cancel = z.object({
  reason: z.string().trim().max(500).default(''),
});

const registrationParams = z.object({ id: objectId, userId: objectId });

const checkIn = z.object({
  checkedIn: z.boolean().default(true),
});

const calendarRange = z
  .object({
    from: z.coerce.date({ error: 'Enter a valid start date' }),
    to: z.coerce.date({ error: 'Enter a valid end date' }),
  })
  .refine((r) => r.to > r.from, { message: '`to` must be after `from`', path: ['to'] })
  .refine((r) => r.to - r.from <= 400 * 24 * 60 * 60 * 1000, { message: 'Range can be at most about a year', path: ['to'] });

module.exports = { create, update, list, cancel, registrationParams, checkIn, calendarRange };
