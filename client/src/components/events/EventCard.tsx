'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import type { SyncEvent } from '@/lib/api';
import { formatEventWhen, formatVenue } from '@/lib/format';
import { Avatar } from '@/components/ui/surface';
import { cn } from '@/lib/cn';
import EventCover from './EventCover';
import RsvpButton from './RsvpButton';

export function CapacityBar({ event }: { event: SyncEvent }) {
  if (event.capacity == null) {
    return <span className="text-xs text-muted">{event.attendeeCount} going</span>;
  }
  const ratio = Math.min(event.attendeeCount / event.capacity, 1);
  return (
    <div className="min-w-0 flex-1">
      <div className="flex justify-between text-xs text-muted">
        <span>{event.spotsLeft === 0 ? 'Full' : `${event.spotsLeft} spots left`}</span>
        <span className="tabular-nums">
          {event.attendeeCount}/{event.capacity}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-700', ratio >= 1 ? 'bg-warning' : ratio > 0.8 ? 'bg-primary' : 'bg-success')}
          style={{ width: `${Math.max(ratio * 100, 3)}%` }}
        />
      </div>
    </div>
  );
}

/** Photo-first event card that lifts on hover. */
export default function EventCard({ event, onChange }: { event: SyncEvent; onChange: (event: SyncEvent) => void }) {
  const host = event.owner.organization || event.owner.name;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lifted">
      <Link href={`/events/${event.id}`} className="block" aria-label={event.title}>
        <EventCover event={event} className="aspect-[16/10]" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/events/${event.id}`} className="line-clamp-2 text-[15px] font-semibold leading-snug hover:text-primary">
          {event.title}
        </Link>
        <div className="mt-2 space-y-1 text-sm text-muted">
          <p className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0" />
            <span className="truncate">{formatEventWhen(event)}</span>
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{formatVenue(event)}</span>
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Avatar name={host} src={event.owner.avatarUrl} size={20} />
          <span className="truncate">{host}</span>
        </div>
        <div className="mt-auto flex items-end gap-3 pt-4">
          <CapacityBar event={event} />
          <RsvpButton event={event} onChange={onChange} className="shrink-0" />
        </div>
      </div>
    </article>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="aspect-[16/10] animate-pulse bg-surface-muted" />
      <div className="space-y-2.5 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-surface-muted" />
        <div className="h-8 w-full animate-pulse rounded-lg bg-surface-muted" />
      </div>
    </div>
  );
}
