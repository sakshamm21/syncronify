'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTicketAlt } from 'react-icons/fa';
import { useEventsSync } from '@/context/EventContext';
import { meApi, type SyncEvent } from '@/lib/api';
import { formatEventWhen, formatVenue } from '@/lib/format';

/** The user's next few registered events. */
export default function UpNext() {
  const { version } = useEventsSync();
  const [events, setEvents] = useState<SyncEvent[] | null>(null);

  useEffect(() => {
    meApi
      .registrations(true)
      .then((items) => setEvents(items.filter((e) => e.status !== 'cancelled').slice(0, 3)))
      .catch(() => setEvents([]));
  }, [version]);

  if (!events || events.length === 0) return null;

  return (
    <section className="brutal-card bg-white border-4 border-black p-5 shadow-[6px_6px_0px_#000]">
      <h3 className="font-heading font-black text-lg uppercase flex items-center gap-2 mb-3">
        <FaTicketAlt /> Up Next For You
      </h3>
      <ul className="grid gap-3 md:grid-cols-3">
        {events.map((event) => (
          <li key={event.id}>
            <Link href={`/events/${event.id}`} className="block h-full border-2 border-black p-3 bg-[#F4F4F0] hover:bg-[#FFE600]">
              <p className="font-black text-sm truncate">{event.title}</p>
              <p className="text-[11px] font-bold">{formatEventWhen(event)}</p>
              <p className="text-[11px] font-medium truncate">{formatVenue(event)}</p>
              {event.viewer.registration === 'waitlisted' && (
                <span className="brutal-badge bg-[#FFE600] text-black text-[10px] mt-1 inline-block">Waitlisted</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
