import React from 'react';
import { Check, Hourglass } from 'lucide-react';
import type { SyncEvent } from '@/lib/api';
import { CATEGORY_GRADIENTS, CATEGORY_LABELS } from '@/lib/format';
import { cn } from '@/lib/cn';

const pill = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md [&_svg]:size-3';

/** Event photo (or a category gradient) with status pills. */
export default function EventCover({ event, className, showDate = true }: { event: SyncEvent; className?: string; showDate?: boolean }) {
  const start = new Date(event.startsAt);
  const status =
    event.status === 'cancelled'
      ? { label: 'Cancelled', className: 'bg-danger/90 text-white' }
      : event.status === 'draft'
        ? { label: 'Draft', className: 'bg-black/60 text-white' }
        : event.viewer.registration === 'going'
          ? { label: 'Going', icon: <Check />, className: 'bg-success/90 text-white' }
          : event.viewer.registration === 'waitlisted'
            ? { label: 'Waitlisted', icon: <Hourglass />, className: 'bg-warning/90 text-white' }
            : event.isPast
              ? { label: 'Ended', className: 'bg-black/60 text-white' }
              : null;

  return (
    <div className={cn('relative overflow-hidden bg-surface-muted', className)}>
      {event.coverImageUrl ? (
        <img
          src={event.coverImageUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className={cn('size-full bg-gradient-to-br transition-transform duration-700 ease-out group-hover:scale-[1.04]', CATEGORY_GRADIENTS[event.category])}>
          <div className="size-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

      <span className={cn(pill, 'absolute left-3 top-3 bg-white/85 text-zinc-900 dark:bg-black/50 dark:text-white')}>
        {CATEGORY_LABELS[event.category]}
      </span>
      {status && (
        <span className={cn(pill, 'absolute right-3 top-3', status.className)}>
          {status.icon}
          {status.label}
        </span>
      )}
      {showDate && (
        <div className="absolute bottom-3 left-3 flex flex-col items-center rounded-xl bg-white/90 px-2.5 py-1 text-zinc-900 shadow-soft backdrop-blur-md dark:bg-black/55 dark:text-white">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary dark:text-primary-soft-foreground">
            {start.toLocaleDateString(undefined, { month: 'short' })}
          </span>
          <span className="text-lg font-semibold leading-none tabular-nums">{start.getDate()}</span>
        </div>
      )}
    </div>
  );
}
