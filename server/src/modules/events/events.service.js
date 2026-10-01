const { Event, Registration, Message, Note } = require('../../models');
const env = require('../../config/env');
const { forbidden, badRequest } = require('../../lib/errors');
const { paginationMeta, escapeRegex } = require('../../lib/schemas');
const { buildEventCalendar } = require('../../lib/ics');
const notifications = require('../notifications/notifications.service');
const { fillFromWaitlist } = require('./registrations.service');
const {
  OWNER_FIELDS,
  canPublishPublicEvents,
  findViewableEvent,
  findManageableEvent,
  withViewerContext,
  present,
} = require('./events.policy');
const { EVENT_VISIBILITY, EVENT_STATUS, NOTIFICATION_TYPES } = require('../../constants');

const publicListing = () => ({ visibility: EVENT_VISIBILITY.PUBLIC, status: EVENT_STATUS.PUBLISHED });

async function notifyAttendees(event, { type, title, body }) {
  const attendees = await Registration.find({ event: event._id }).distinct('user');
  await notifications.notify(attendees, { type, title, body, eventId: event._id }, { email: true });
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

async function listPublic(viewer, { q, category, organizer, from, to, sort, includePast, page, limit }) {
  const filter = publicListing();
  if (!includePast) filter.endsAt = { $gte: new Date() };
  if (category) filter.category = category;
  if (organizer) filter.owner = organizer;
  if (from || to) filter.startsAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }, { 'venue.name': pattern }, { tags: pattern }];
  }

  const order = {
    soonest: { startsAt: 1 },
    popular: { attendeeCount: -1, startsAt: 1 },
    newest: { createdAt: -1 },
  }[sort];

  const [events, total] = await Promise.all([
    Event.find(filter).sort(order).skip((page - 1) * limit).limit(limit).populate('owner', OWNER_FIELDS),
    Event.countDocuments(filter),
  ]);
  return { items: await withViewerContext(events, viewer), meta: paginationMeta({ page, limit }, total) };
}

/** Upcoming public events matching the user's interests that they haven't joined yet. */
async function recommendedFor(user, limit = 6) {
  const joined = await Registration.find({ user: user.id }).distinct('event');
  const filter = { ...publicListing(), startsAt: { $gte: new Date() }, owner: { $ne: user._id } };
  const byPopularity = { attendeeCount: -1, startsAt: 1 };

  let events = [];
  if (user.interests?.length) {
    events = await Event.find({ ...filter, _id: { $nin: joined }, category: { $in: user.interests } })
      .sort(byPopularity)
      .limit(limit)
      .populate('owner', OWNER_FIELDS);
  }
  // Top up with popular events so new users without interests still get suggestions.
  if (events.length < limit) {
    const more = await Event.find({ ...filter, _id: { $nin: [...joined, ...events.map((e) => e._id)] } })
      .sort(byPopularity)
      .limit(limit - events.length)
      .populate('owner', OWNER_FIELDS);
    events = events.concat(more);
  }
  return withViewerContext(events, user);
}

/** Venues of upcoming public events that have map coordinates, with what's on at each. */
async function venueDirectory() {
  const events = await Event.find({
    ...publicListing(),
    endsAt: { $gte: new Date() },
    'venue.latitude': { $ne: null },
    'venue.longitude': { $ne: null },
  })
    .sort({ startsAt: 1 })
    .select('title category startsAt endsAt venue');

  const venues = new Map();
  for (const event of events) {
    const { name, address, latitude, longitude } = event.venue;
    const key = `${(name || '').toLowerCase()}|${latitude.toFixed(4)}|${longitude.toFixed(4)}`;
    if (!venues.has(key)) venues.set(key, { name: name || address || 'Unnamed venue', address: address || '', latitude, longitude, events: [] });
    venues.get(key).events.push({ id: event.id, title: event.title, category: event.category, startsAt: event.startsAt, endsAt: event.endsAt });
  }
  return [...venues.values()].sort((a, b) => b.events.length - a.events.length || a.name.localeCompare(b.name));
}

async function getForViewer(viewer, id) {
  return present(await findViewableEvent(viewer, id), viewer);
}

/** Everything that belongs on the user's calendar in a date range. */
async function calendarFor(user, { from, to }) {
  const registeredIds = await Registration.find({ user: user.id }).distinct('event');
  const events = await Event.find({
    startsAt: { $lt: to },
    endsAt: { $gt: from },
    status: { $ne: EVENT_STATUS.DRAFT },
    $or: [{ owner: user._id }, { _id: { $in: registeredIds }, visibility: EVENT_VISIBILITY.PUBLIC }],
  })
    .sort({ startsAt: 1 })
    .populate('owner', OWNER_FIELDS);

  return withViewerContext(events, user);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

async function create(user, input) {
  const visibility = input.visibility ?? (canPublishPublicEvents(user) ? EVENT_VISIBILITY.PUBLIC : EVENT_VISIBILITY.PRIVATE);
  if (visibility === EVENT_VISIBILITY.PUBLIC && !canPublishPublicEvents(user)) {
    throw forbidden('Only organisers can publish public events. Apply to become an organiser from your profile.', 'ORGANIZER_ONLY');
  }

  const isPublic = visibility === EVENT_VISIBILITY.PUBLIC;
  const event = await Event.create({
    ...input,
    visibility,
    // Personal events have no registration, so drafts and capacity don't apply.
    status: isPublic ? input.status ?? EVENT_STATUS.PUBLISHED : EVENT_STATUS.PUBLISHED,
    capacity: isPublic ? input.capacity ?? null : null,
    owner: user._id,
  });
  await event.populate('owner', OWNER_FIELDS);
  return present(event, user);
}

const logisticsSnapshot = (event) =>
  JSON.stringify([event.startsAt, event.endsAt, event.venue, event.onlineUrl]);

async function update(user, id, changes) {
  const event = await findManageableEvent(user, id);
  if (event.status === EVENT_STATUS.CANCELLED) throw badRequest('Cancelled events cannot be edited');

  if (changes.visibility && changes.visibility !== event.visibility) {
    if (changes.visibility === EVENT_VISIBILITY.PUBLIC && !canPublishPublicEvents(user)) {
      throw forbidden('Only organisers can publish public events.', 'ORGANIZER_ONLY');
    }
    if (await Registration.exists({ event: event._id })) {
      throw badRequest('This event already has registrations, so its visibility cannot change');
    }
  }

  const logisticsBefore = logisticsSnapshot(event);
  const wasPublished = event.status === EVENT_STATUS.PUBLISHED;
  const previousCapacity = event.capacity;

  event.set(changes);
  if (event.endsAt <= event.startsAt) throw badRequest('The event must end after it starts');
  await event.save();

  if (event.visibility === EVENT_VISIBILITY.PUBLIC && wasPublished && logisticsSnapshot(event) !== logisticsBefore) {
    await notifyAttendees(event, {
      type: NOTIFICATION_TYPES.EVENT_UPDATED,
      title: `Update: ${event.title}`,
      body: 'The time or location of an event you registered for has changed. Check the latest details.',
    });
  }

  const capacityGrew =
    previousCapacity !== null && (event.capacity === null || event.capacity > previousCapacity);
  if (capacityGrew) await fillFromWaitlist(event);

  return getForViewer(user, id);
}

async function cancel(user, id, { reason }) {
  const event = await findManageableEvent(user, id);
  if (event.visibility !== EVENT_VISIBILITY.PUBLIC) {
    throw badRequest('Only public events can be cancelled. Delete personal events instead.');
  }
  if (event.status !== EVENT_STATUS.CANCELLED) {
    event.status = EVENT_STATUS.CANCELLED;
    await event.save();
    await notifyAttendees(event, {
      type: NOTIFICATION_TYPES.EVENT_CANCELLED,
      title: `Cancelled: ${event.title}`,
      body: reason || 'The organiser has cancelled this event.',
    });
  }
  return present(event, user);
}

async function remove(user, id) {
  const event = await findManageableEvent(user, id);

  if (event.visibility === EVENT_VISIBILITY.PUBLIC && event.status === EVENT_STATUS.PUBLISHED && !event.isPast) {
    await notifyAttendees(event, {
      type: NOTIFICATION_TYPES.EVENT_CANCELLED,
      title: `Cancelled: ${event.title}`,
      body: 'The organiser has removed this event.',
    });
  }

  await Promise.all([
    Registration.deleteMany({ event: event._id }),
    Message.deleteMany({ event: event._id }),
    Note.updateMany({ event: event._id }, { $set: { event: null } }),
  ]);
  await event.deleteOne();
}

async function toCalendarFile(viewer, id) {
  const event = await findViewableEvent(viewer, id);
  const location = [event.venue?.name, event.venue?.address].filter(Boolean).join(', ') || event.onlineUrl;
  const slug = event.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'event';
  return {
    filename: `${slug}.ics`,
    content: buildEventCalendar({
      uid: `${event.id}@syncronify`,
      title: event.title,
      description: event.description,
      location,
      url: `${env.clientUrl}/events/${event.id}`,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      cancelled: event.status === EVENT_STATUS.CANCELLED,
    }),
  };
}

module.exports = { listPublic, recommendedFor, venueDirectory, getForViewer, calendarFor, create, update, cancel, remove, toCalendarFile };
