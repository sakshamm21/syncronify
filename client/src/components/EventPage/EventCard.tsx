'use client';

import React from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaCheck } from 'react-icons/fa';
import type { SyncEvent } from '@/lib/api';
import { CATEGORY_LABELS, capacityLabel, formatEventWhen, formatVenue } from '@/lib/format';
import RsvpButton from './RsvpButton';

export function EventCover({ event, className = 'h-44' }: { event: SyncEvent; className?: string }) {
  return (
    <div className={`relative w-full border-2 border-black overflow-hidden bg-black ${className}`}>
      {event.coverImageUrl ? (
        <img src={event.coverImageUrl} alt="" className="w-full h-full object-cover opacity-90" />
      ) : (
        <div className="w-full h-full bg-[#00F0FF] flex items-center justify-center font-heading font-black text-3xl uppercase text-black/70">
          {CATEGORY_LABELS[event.category]}
        </div>
      )}
      <span className="absolute top-2 left-2 brutal-badge bg-[#FFE600] text-black">{CATEGORY_LABELS[event.category]}</span>
      {event.viewer.registration === 'going' && (
        <span className="absolute top-2 right-2 brutal-badge bg-[#00FF66] text-black flex items-center gap-1">
          <FaCheck /> GOING
        </span>
      )}
      {event.status === 'cancelled' && (
        <span className="absolute top-2 right-2 brutal-badge bg-[#FF007A] text-white">CANCELLED</span>
      )}
      {event.status === 'draft' && <span className="absolute top-2 right-2 brutal-badge bg-white text-black">DRAFT</span>}
    </div>
  );
}

export default function EventCard({ event, onChange }: { event: SyncEvent; onChange: (event: SyncEvent) => void }) {
  return (
    <article className="brutal-card brutal-card-hover bg-white border-4 border-black p-5 flex flex-col justify-between">
      <div>
        <EventCover event={event} className="h-44 mb-4" />
        <h3 className="font-heading font-black text-xl uppercase tracking-tight text-black mb-2 leading-snug">
          <Link href={`/events/${event.id}`} className="hover:underline">
            {event.title}
          </Link>
        </h3>
        <div className="space-y-1.5 text-xs font-bold text-black mb-3">
          <p className="flex items-center gap-2">
            <FaCalendarAlt className="text-[#FF007A] shrink-0" />
            <span>{formatEventWhen(event)}</span>
          </p>
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-[#00A3B0] shrink-0" />
            <span className="truncate">{formatVenue(event)}</span>
          </p>
          <p className="flex items-center gap-2 text-[11px] text-gray-700">
            <FaUsers className="text-black shrink-0" />
            <span>
              {event.owner.organization || event.owner.name} · {capacityLabel(event)}
            </span>
          </p>
        </div>
        <p className="text-xs font-medium text-black line-clamp-2 leading-relaxed mb-4">{event.description}</p>
      </div>

      <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2">
        <Link href={`/events/${event.id}`} className="brutal-btn bg-[#F4F4F0] text-black px-3.5 py-2 text-xs uppercase">
          View Details
        </Link>
        <RsvpButton event={event} onChange={onChange} />
      </div>
    </article>
  );
}
