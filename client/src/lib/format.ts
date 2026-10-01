import type { CategoryValue, NoteTag, Role, SyncEvent } from './api/types';

export const CATEGORY_LABELS: Record<CategoryValue, string> = {
  tech: 'Tech & Code',
  workshop: 'Workshop',
  cultural: 'Cultural',
  sports: 'Sports',
  meetup: 'Meetup',
  conference: 'Conference',
  social: 'Social',
  other: 'Other',
};
export const CATEGORIES = Object.keys(CATEGORY_LABELS) as CategoryValue[];

export const NOTE_TAG_LABELS: Record<NoteTag, string> = {
  plan: 'Event Plan',
  speaker: 'Speaker',
  logistics: 'Logistics',
  ideas: 'Ideas',
  personal: 'Personal',
};
export const NOTE_TAGS = Object.keys(NOTE_TAG_LABELS) as NoteTag[];

export const ROLE_LABELS: Record<Role, string> = {
  member: 'Member',
  organizer: 'Organizer',
  admin: 'Super Admin',
};

/** Where each role lands after signing in. */
export const ROLE_HOME: Record<Role, string> = {
  member: '/dashboard',
  organizer: '/admin-dashboard',
  admin: '/application-admin-dashboard',
};

const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const fullFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const formatDay = (iso: string) => dayFormat.format(new Date(iso));
export const formatTime = (iso: string) => timeFormat.format(new Date(iso));
export const formatDateTime = (iso: string) => fullFormat.format(new Date(iso));

/** "Sat, 4 Oct · 10:00 – 16:00", or both dates when the event spans days. */
export function formatEventWhen(event: Pick<SyncEvent, 'startsAt' | 'endsAt'>): string {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  if (start.toDateString() === end.toDateString()) {
    return `${formatDay(event.startsAt)} · ${formatTime(event.startsAt)} – ${formatTime(event.endsAt)}`;
  }
  return `${formatDay(event.startsAt)} ${formatTime(event.startsAt)} – ${formatDay(event.endsAt)} ${formatTime(event.endsAt)}`;
}

export const formatVenue = (event: Pick<SyncEvent, 'venue' | 'onlineUrl'>) =>
  event.venue?.name || event.venue?.address || (event.onlineUrl ? 'Online' : 'Venue to be announced');

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

/** "5 minutes ago", "yesterday". */
export function formatRelative(iso: string): string {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

/** Short description of how full an event is. */
export function capacityLabel(event: Pick<SyncEvent, 'capacity' | 'attendeeCount' | 'spotsLeft'>): string {
  if (event.capacity == null) return `${event.attendeeCount} going`;
  if (event.spotsLeft === 0) return `Full · ${event.attendeeCount}/${event.capacity}`;
  return `${event.spotsLeft} of ${event.capacity} spots left`;
}
