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

/** Cover art for events without a photo: a loud gradient per category. */
export const CATEGORY_GRADIENTS: Record<CategoryValue, string> = {
  tech: 'from-[#3df5ff] via-[#6a3dff] to-[#ff4fd8]',
  workshop: 'from-[#d4ff3a] via-[#3dffa0] to-[#3df5ff]',
  cultural: 'from-[#ff4fd8] via-[#ff7a1a] to-[#ffd23d]',
  sports: 'from-[#3dffa0] via-[#d4ff3a] to-[#ffd23d]',
  meetup: 'from-[#ff7a1a] via-[#ff4f8b] to-[#8b5cff]',
  conference: 'from-[#6a3dff] via-[#3d7bff] to-[#3df5ff]',
  social: 'from-[#ff4fd8] via-[#8b5cff] to-[#3df5ff]',
  other: 'from-[#9aa0b4] via-[#5d6478] to-[#2b2f3d]',
};

export const CATEGORY_EMOJI: Record<CategoryValue, string> = {
  tech: '💻',
  workshop: '🛠️',
  cultural: '🎭',
  sports: '⚽',
  meetup: '☕',
  conference: '🎤',
  social: '🎉',
  other: '✨',
};

export const NOTE_TAG_EMOJI: Record<NoteTag, string> = {
  plan: '🗺️',
  speaker: '🎙️',
  logistics: '📦',
  ideas: '💡',
  personal: '🫶',
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

/** Date -> value for <input type="datetime-local"> (local time, minute precision). */
export function toDateTimeInput(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value -> Date (interpreted as local time). */
export const fromDateTimeInput = (value: string) => new Date(value);
