import type { FilterQuery, Types } from 'mongoose';
import { Event, Registration, type EventDocument, type IEvent, type UserDocument } from '../../models';
import { badRequest, notFound } from '../../lib/errors';
import * as notifications from '../notifications/notifications.service';
import { findViewableEvent, findManageableEvent, present, withViewerContext, OWNER_FIELDS } from './events.policy';
import { REGISTRATION_STATUS, NOTIFICATION_TYPES, type RegistrationStatus } from '../../constants';

type AttendeeUser = Pick<UserDocument, 'id' | 'name' | 'email' | 'avatarUrl'>;

/**
 * Atomically takes a seat if one is free. Two people can never get the last
 * seat because the capacity check and the increment are a single update.
 */
export async function claimSeat(eventId: Types.ObjectId): Promise<boolean> {
  const claimed = await Event.updateOne(
    { _id: eventId, $or: [{ capacity: null }, { $expr: { $lt: ['$attendeeCount', '$capacity'] } }] },
    { $inc: { attendeeCount: 1 } }
  );
  return claimed.modifiedCount === 1;
}

const releaseSeat = (eventId: Types.ObjectId) =>
  Event.updateOne({ _id: eventId, attendeeCount: { $gt: 0 } }, { $inc: { attendeeCount: -1 } });

/** Moves people off the waitlist, first come first served, while seats are free. */
export async function fillFromWaitlist(event: EventDocument): Promise<Types.ObjectId[]> {
  if (!event.isOpenForRegistration()) return [];
  const promoted: Types.ObjectId[] = [];

  while (await Registration.exists({ event: event._id, status: REGISTRATION_STATUS.WAITLISTED })) {
    if (!(await claimSeat(event._id))) break;
    const next = await Registration.findOneAndUpdate(
      { event: event._id, status: REGISTRATION_STATUS.WAITLISTED },
      { $set: { status: REGISTRATION_STATUS.GOING } },
      { sort: { createdAt: 1 }, new: true }
    );
    if (!next) {
      await releaseSeat(event._id);
      break;
    }
    promoted.push(next.user);
  }

  await notifications.notify(
    promoted,
    {
      type: NOTIFICATION_TYPES.WAITLIST_PROMOTED,
      title: `You're in: ${event.title}`,
      body: 'A spot opened up and you have been moved off the waitlist.',
      eventId: event._id,
    },
    { email: true }
  );
  return promoted;
}

export async function register(user: UserDocument, eventId: string) {
  const event = await findViewableEvent(user, eventId);
  if (!event.isOpenForRegistration()) throw badRequest('Registration is closed for this event', 'REGISTRATION_CLOSED');
  if (event.isOwnedBy(user.id)) throw badRequest('You are organising this event', 'OWN_EVENT');

  const existing = await Registration.findOne({ event: event._id, user: user.id });
  if (!existing) {
    const gotSeat = await claimSeat(event._id);
    try {
      await Registration.create({
        event: event._id,
        user: user._id,
        status: gotSeat ? REGISTRATION_STATUS.GOING : REGISTRATION_STATUS.WAITLISTED,
      });
    } catch (err) {
      // A concurrent request registered the same user first; give the seat back.
      if (gotSeat) await releaseSeat(event._id);
      if ((err as { code?: unknown })?.code !== 11000) throw err;
    }
  }

  return present(await findViewableEvent(user, eventId), user);
}

export async function unregister(user: UserDocument, eventId: string) {
  const event = await findViewableEvent(user, eventId);
  const registration = await Registration.findOneAndDelete({ event: event._id, user: user.id });
  if (!registration) throw notFound('You are not registered for this event', 'NOT_REGISTERED');

  if (registration.status === REGISTRATION_STATUS.GOING) {
    await releaseSeat(event._id);
    await fillFromWaitlist(event);
  }
  return present(await findViewableEvent(user, eventId), user);
}

/** Attendee list for the organiser, including contact email for check-in. */
export async function listForEvent(user: UserDocument, eventId: string, { status }: { status?: RegistrationStatus }) {
  const event = await findManageableEvent(user, eventId);
  const registrations = await Registration.find({ event: event._id, ...(status ? { status } : {}) })
    .sort({ status: 1, createdAt: 1 })
    .populate<{ user: AttendeeUser | null }>('user', 'name email avatarUrl');

  const items = registrations.map((r) => ({
    id: r.id as string,
    status: r.status,
    registeredAt: r.createdAt,
    checkedInAt: r.checkedInAt,
    user: r.user ? { id: r.user.id, name: r.user.name, email: r.user.email, avatarUrl: r.user.avatarUrl } : null,
  }));

  const counts = {
    going: items.filter((i) => i.status === REGISTRATION_STATUS.GOING).length,
    waitlisted: items.filter((i) => i.status === REGISTRATION_STATUS.WAITLISTED).length,
    checkedIn: items.filter((i) => i.checkedInAt).length,
  };
  return { items, counts };
}

export async function setCheckIn(user: UserDocument, eventId: string, attendeeId: string, checkedIn: boolean) {
  const event = await findManageableEvent(user, eventId);
  const registration = await Registration.findOne({ event: event._id, user: attendeeId });
  if (!registration) throw notFound('This person is not registered for the event');
  if (registration.status !== REGISTRATION_STATUS.GOING) throw badRequest('Waitlisted attendees cannot be checked in');

  registration.checkedInAt = checkedIn ? new Date() : null;
  await registration.save();
  return { id: registration.id as string, status: registration.status, checkedInAt: registration.checkedInAt };
}

/** The user's own registrations ("my tickets"), soonest first. */
export async function listForUser(user: UserDocument, { upcomingOnly }: { upcomingOnly: boolean }) {
  const registrations = await Registration.find({ user: user.id }).select('event');
  const filter: FilterQuery<IEvent> = { _id: { $in: registrations.map((r) => r.event) } };
  if (upcomingOnly) filter.endsAt = { $gte: new Date() };

  const events = await Event.find(filter).sort({ startsAt: upcomingOnly ? 1 : -1 }).populate('owner', OWNER_FIELDS);
  return withViewerContext(events, user);
}
