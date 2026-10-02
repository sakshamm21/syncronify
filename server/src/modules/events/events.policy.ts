/**
 * Who can see and do what with an event, and the per-viewer view of it.
 * Shared by the events, registrations and chat services.
 */
import { Event, Registration, type EventDocument, type IEvent, type UserDocument } from '../../models';
import { forbidden, notFound } from '../../lib/errors';
import { ROLES, EVENT_VISIBILITY, EVENT_STATUS, type RegistrationStatus } from '../../constants';

export const OWNER_FIELDS = 'name avatarUrl organization role';

/** The signed-in user, or undefined for anonymous visitors. */
export type Viewer = UserDocument | undefined;

export const canPublishPublicEvents = (user: UserDocument) => user.role === ROLES.ORGANIZER || user.role === ROLES.ADMIN;

export function canManage(user: Viewer, event: EventDocument): boolean {
  if (!user) return false;
  if (event.isOwnedBy(user.id)) return true;
  // Admins moderate public events but never see anyone's private calendar.
  return user.role === ROLES.ADMIN && event.visibility === EVENT_VISIBILITY.PUBLIC;
}

function canView(user: Viewer, event: EventDocument): boolean {
  if (event.visibility === EVENT_VISIBILITY.PRIVATE) return Boolean(user) && event.isOwnedBy(user?.id);
  if (event.status === EVENT_STATUS.DRAFT) return canManage(user, event);
  return true;
}

export async function findViewableEvent(viewer: Viewer, id: string): Promise<EventDocument> {
  const event = await Event.findById(id).populate('owner', OWNER_FIELDS);
  // Hidden events look exactly like missing ones.
  if (!event || !canView(viewer, event)) throw notFound('Event not found');
  return event;
}

export async function findManageableEvent(user: UserDocument, id: string): Promise<EventDocument> {
  const event = await findViewableEvent(user, id);
  if (!canManage(user, event)) throw forbidden('Only the organiser can change this event');
  return event;
}

/** Chat is for public events, between the organiser, attendees and admins. */
export function canChat(user: Viewer, event: EventDocument, registrationStatus: RegistrationStatus | null | undefined): boolean {
  if (!user || event.visibility !== EVENT_VISIBILITY.PUBLIC || event.status === EVENT_STATUS.DRAFT) return false;
  return canManage(user, event) || Boolean(registrationStatus);
}

/** An event as the API returns it: the stored fields plus the viewer's relationship to it. */
export type PresentedEvent = Omit<IEvent, 'owner'> & {
  id: string;
  /** A user summary when populated, otherwise the owner's id. */
  owner: unknown;
  spotsLeft: number | null;
  isPast: boolean;
  viewer: {
    isOwner: boolean;
    canManage: boolean;
    canChat: boolean;
    registration: RegistrationStatus | null;
  };
};

/** Adds a `viewer` block describing the current user's relationship to each event. */
export async function withViewerContext(events: EventDocument[], viewer: Viewer): Promise<PresentedEvent[]> {
  const registrations = viewer
    ? await Registration.find({ user: viewer.id, event: { $in: events.map((e) => e._id) } }).select('event status')
    : [];
  const statusByEvent = new Map(registrations.map((r) => [String(r.event), r.status]));

  return events.map((event) => {
    const registration = statusByEvent.get(String(event._id)) ?? null;
    return {
      // toJSON adds `id` and the virtuals (see config/db.ts), which Mongoose's types don't model.
      ...(event.toJSON() as unknown as Omit<PresentedEvent, 'viewer'>),
      viewer: {
        isOwner: Boolean(viewer) && event.isOwnedBy(viewer?.id),
        canManage: canManage(viewer, event),
        canChat: canChat(viewer, event, registration),
        registration,
      },
    };
  });
}

export async function present(event: EventDocument, viewer: Viewer): Promise<PresentedEvent> {
  const [json] = await withViewerContext([event], viewer);
  return json;
}
