/**
 * Who can see and do what with an event, and the per-viewer view of it.
 * Shared by the events, registrations and chat services.
 */
const { Event, Registration } = require('../../models');
const { forbidden, notFound } = require('../../lib/errors');
const { ROLES, EVENT_VISIBILITY, EVENT_STATUS } = require('../../constants');

const OWNER_FIELDS = 'name avatarUrl organization role';

const canPublishPublicEvents = (user) => user.role === ROLES.ORGANIZER || user.role === ROLES.ADMIN;

function canManage(user, event) {
  if (!user) return false;
  if (event.isOwnedBy(user.id)) return true;
  // Admins moderate public events but never see anyone's private calendar.
  return user.role === ROLES.ADMIN && event.visibility === EVENT_VISIBILITY.PUBLIC;
}

function canView(user, event) {
  if (event.visibility === EVENT_VISIBILITY.PRIVATE) return Boolean(user) && event.isOwnedBy(user.id);
  if (event.status === EVENT_STATUS.DRAFT) return canManage(user, event);
  return true;
}

async function findViewableEvent(viewer, id) {
  const event = await Event.findById(id).populate('owner', OWNER_FIELDS);
  // Hidden events look exactly like missing ones.
  if (!event || !canView(viewer, event)) throw notFound('Event not found');
  return event;
}

async function findManageableEvent(user, id) {
  const event = await findViewableEvent(user, id);
  if (!canManage(user, event)) throw forbidden('Only the organiser can change this event');
  return event;
}

/** Chat is for public events, between the organiser, attendees and admins. */
function canChat(user, event, registrationStatus) {
  if (!user || event.visibility !== EVENT_VISIBILITY.PUBLIC || event.status === EVENT_STATUS.DRAFT) return false;
  return canManage(user, event) || Boolean(registrationStatus);
}

/** Adds a `viewer` block describing the current user's relationship to each event. */
async function withViewerContext(events, viewer) {
  const registrations = viewer
    ? await Registration.find({ user: viewer.id, event: { $in: events.map((e) => e._id) } }).select('event status')
    : [];
  const statusByEvent = new Map(registrations.map((r) => [String(r.event), r.status]));

  return events.map((event) => {
    const registration = statusByEvent.get(String(event._id)) ?? null;
    return {
      ...event.toJSON(),
      viewer: {
        isOwner: Boolean(viewer) && event.isOwnedBy(viewer.id),
        canManage: canManage(viewer, event),
        canChat: canChat(viewer, event, registration),
        registration,
      },
    };
  });
}

async function present(event, viewer) {
  const [json] = await withViewerContext([event], viewer);
  return json;
}

module.exports = {
  OWNER_FIELDS,
  canPublishPublicEvents,
  canManage,
  canView,
  canChat,
  findViewableEvent,
  findManageableEvent,
  withViewerContext,
  present,
};
