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

/** Where people land after signing in; role-specific tools are reachable from there. */
export const APP_HOME = '/dashboard';

/** Cover art for events without a photo: a gradient per category. */
export const CATEGORY_GRADIENTS: Record<CategoryValue, string> = {
  tech: 'from-indigo-500 via-violet-500 to-fuchsia-500',
  workshop: 'from-sky-500 via-cyan-500 to-teal-400',
  cultural: 'from-rose-500 via-pink-500 to-orange-400',
  sports: 'from-emerald-500 via-green-500 to-lime-400',
  meetup: 'from-amber-500 via-orange-500 to-rose-500',
  conference: 'from-blue-600 via-indigo-500 to-violet-500',
  social: 'from-fuchsia-500 via-purple-500 to-indigo-500',
  other: 'from-slate-500 via-slate-600 to-zinc-700',
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

/** Date -> value for <input type="datetime-local"> (local time, minute precision). */
export function toDateTimeInput(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value -> Date (interpreted as local time). */
export const fromDateTimeInput = (value: string) => new Date(value);

/** "Good morning" / "Good afternoon" / "Good evening". */
export function greeting(date = new Date()): string {
  const hour = date.getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}
