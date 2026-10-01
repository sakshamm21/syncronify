'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaFire, FaMapMarkerAlt } from 'react-icons/fa';
import { useEventsSync } from '@/context/EventContext';
import { eventsApi, type SyncEvent } from '@/lib/api';
import { CATEGORY_LABELS, formatEventWhen, formatVenue } from '@/lib/format';

const COLORS = ['bg-[#FFE600]', 'bg-[#00F0FF]', 'bg-[#FF007A] text-white'];

/** "Picked for you": upcoming events matching the user's interests. */
export default function RecommendedCarousel() {
  const { version } = useEventsSync();
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    eventsApi
      .recommended()
      .then((items) => {
        setEvents(items);
        setIndex(0);
      })
      .catch(() => setEvents([]));
  }, [version]);

  if (events.length === 0) return null;

  const current = events[index];
  const step = (delta: number) => setIndex((i) => (i + delta + events.length) % events.length);

  return (
    <section className="brutal-card bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
      <div className="flex items-center justify-between border-b-4 border-black pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-[#00FF66] border-2 border-black flex items-center justify-center">
            <FaFire />
          </span>
          <h3 className="font-heading font-black text-lg uppercase tracking-tight">Picked For You</h3>
        </div>
        {events.length > 1 && (
          <div className="flex gap-2">
            <button onClick={() => step(-1)} aria-label="Previous" className="brutal-btn bg-white p-2 text-xs">
              <FaChevronLeft />
            </button>
            <button onClick={() => step(1)} aria-label="Next" className="brutal-btn bg-white p-2 text-xs">
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      <Link href={`/events/${current.id}`} className={`block border-2 border-black p-5 ${COLORS[index % COLORS.length]} hover:translate-x-[2px] hover:translate-y-[2px] transition-transform`}>
        <span className="brutal-badge bg-black text-white">{CATEGORY_LABELS[current.category]}</span>
        <p className="font-heading font-black text-2xl uppercase mt-3">{current.title}</p>
        <p className="text-xs font-bold mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1"><FaCalendarAlt /> {formatEventWhen(current)}</span>
          <span className="flex items-center gap-1"><FaMapMarkerAlt /> {formatVenue(current)}</span>
        </p>
        {current.description && <p className="text-xs font-medium mt-2 line-clamp-2">{current.description}</p>}
      </Link>

      <p className="text-[11px] font-bold text-gray-600 mt-3">
        Based on your interests. Update them in your profile to get better suggestions.
      </p>
    </section>
  );
}
