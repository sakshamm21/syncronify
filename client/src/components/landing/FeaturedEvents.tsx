'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { MapPin, Users } from 'lucide-react';
import { eventsApi, type SyncEvent } from '@/lib/api';
import { formatEventWhen, formatVenue } from '@/lib/format';
import EventCover from '@/components/events/EventCover';

/** Three real, popular upcoming events, stacked and gently floating. */
export default function FeaturedEvents() {
  const [events, setEvents] = useState<SyncEvent[] | null>(null);

  useEffect(() => {
    eventsApi
      .list({ sort: 'popular', limit: 3 })
      .then(({ items }) => setEvents(items))
      .catch(() => setEvents([]));
  }, []);

  if (events === null) return <div className="mx-auto h-[420px] w-full max-w-md animate-pulse rounded-3xl bg-surface-muted/60" />;
  if (events.length === 0) return null;

  return (
    <div className="relative mx-auto h-[440px] w-full max-w-md">
      {events.map((event, i) => (
        <motion.div
          key={event.id}
          className="absolute w-[88%]"
          style={{ left: `${i * 6}%`, top: `${i * 30}%`, zIndex: 3 - i }}
          initial={{ opacity: 0, y: 40, rotate: i % 2 ? 2 : -2 }}
          animate={{ opacity: 1, y: [0, -8, 0], rotate: i % 2 ? 2 : -2 }}
          transition={{ opacity: { duration: 0.6, delay: 0.2 + i * 0.15 }, y: { duration: 6, delay: i * 0.6, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <Link href={`/events/${event.id}`} className="group block overflow-hidden rounded-2xl border border-border bg-surface shadow-lifted transition hover:shadow-overlay">
            <EventCover event={event} showDate={i === 0} className="aspect-[16/8]" />
            <div className="p-4">
              <p className="truncate font-semibold">{event.title}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                <span className="truncate">{formatEventWhen(event)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span className="flex min-w-0 items-center gap-1"><MapPin className="size-3.5 shrink-0" /><span className="truncate">{formatVenue(event)}</span></span>
                <span className="flex shrink-0 items-center gap-1"><Users className="size-3.5" />{event.attendeeCount} going</span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
