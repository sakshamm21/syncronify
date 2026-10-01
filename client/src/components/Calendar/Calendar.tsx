'use client';

import './Calendar.css';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import type { EventInput, EventSourceFuncArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useEventsSync } from '@/context/EventContext';
import { errorMessage, meApi, type SyncEvent } from '@/lib/api';

interface CalendarProps {
  /** Called when the user clicks an empty day, e.g. to create an event on it. */
  onSelectDate?: (date: Date) => void;
}

const LEGEND = [
  { label: 'Going', color: '#00FF66', text: '#000' },
  { label: 'Waitlisted', color: '#FFE600', text: '#000' },
  { label: 'Organizing', color: '#FF007A', text: '#FFF' },
  { label: 'Personal', color: '#00F0FF', text: '#000' },
  { label: 'Cancelled', color: '#D4D4D4', text: '#555' },
];

function toCalendarEvent(event: SyncEvent): EventInput {
  const kind =
    event.status === 'cancelled'
      ? 'Cancelled'
      : event.visibility === 'private'
        ? 'Personal'
        : event.viewer.isOwner
          ? 'Organizing'
          : event.viewer.registration === 'waitlisted'
            ? 'Waitlisted'
            : 'Going';
  const style = LEGEND.find((l) => l.label === kind)!;
  return {
    id: event.id,
    title: event.title,
    start: event.startsAt,
    end: event.endsAt,
    backgroundColor: style.color,
    borderColor: '#000000',
    textColor: style.text,
    classNames: event.status === 'cancelled' ? ['line-through'] : [],
  };
}

export default function Calendar({ onSelectDate }: CalendarProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const router = useRouter();
  const { version } = useEventsSync();

  useEffect(() => {
    calendarRef.current?.getApi().refetchEvents();
  }, [version]);

  const loadEvents = (info: EventSourceFuncArg, success: (events: EventInput[]) => void, failure: (error: Error) => void) => {
    meApi
      .calendar({ from: info.start.toISOString(), to: info.end.toISOString() })
      .then((events) => success(events.map(toCalendarEvent)))
      .catch((err) => {
        toast.error(errorMessage(err));
        failure(err);
      });
  };

  return (
    <div className="brutal-card p-6 bg-white border-4 border-black shadow-[8px_8px_0px_#000] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-[#FFE600] border-2 border-black flex items-center justify-center text-xl brutal-shadow-sm">
            <FaCalendarAlt />
          </span>
          <div>
            <h2 className="font-heading font-black text-2xl uppercase tracking-tight">My Schedule</h2>
            <p className="text-xs font-bold uppercase">Events you&apos;re attending, organizing and planning</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LEGEND.map((l) => (
            <span key={l.label} className="brutal-badge text-[10px]" style={{ background: l.color, color: l.text }}>
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="brutal-calendar-wrap font-bold text-xs">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={loadEvents}
          eventClick={(info) => router.push(`/events/${info.event.id}`)}
          dateClick={onSelectDate ? (info) => onSelectDate(info.date) : undefined}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          height="auto"
        />
      </div>
      {onSelectDate && <p className="text-[11px] font-bold text-gray-600">Tip: click a day to plan something on it.</p>}
    </div>
  );
}
