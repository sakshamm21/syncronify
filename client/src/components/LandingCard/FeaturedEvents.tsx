'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { eventsApi, type SyncEvent } from '@/lib/api';
import { CATEGORY_LABELS, formatDay, formatTime, formatVenue } from '@/lib/format';

const BADGES = ['bg-[#FF007A] text-white', 'bg-[#00F0FF] text-black'];

/** The two most popular upcoming public events, for the landing page. */
export default function FeaturedEvents() {
  const [events, setEvents] = useState<SyncEvent[] | null>(null);

  useEffect(() => {
    eventsApi
      .list({ sort: 'popular', limit: 2 })
      .then(({ items }) => setEvents(items))
      .catch(() => setEvents([]));
  }, []);

  if (events === null) {
    return <div className="bg-white border-2 border-black p-4 text-xs font-bold">Loading events…</div>;
  }
  if (events.length === 0) {
    return (
      <div className="bg-white border-2 border-black p-4 text-xs font-bold">
        No public events yet. Organizers can publish the first one.
      </div>
    );
  }

  return (
    <>
      {events.map((event, i) => (
        <Link key={event.id} href={`/events/${event.id}`} className="block bg-white border-2 border-black p-4 space-y-2 hover:bg-[#F4F4F0]">
          <span className={`brutal-badge ${BADGES[i % BADGES.length]}`}>{CATEGORY_LABELS[event.category].toUpperCase()}</span>
          <p className="font-heading font-black text-lg text-black">{event.title}</p>
          <p className="text-xs font-bold text-black">
            📍 {formatVenue(event)} • {formatDay(event.startsAt)}, {formatTime(event.startsAt)}
          </p>
        </Link>
      ))}
    </>
  );
}
