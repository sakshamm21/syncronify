'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import type { EventInput, EventSourceFuncArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'sonner';
import { useEventsSync } from '@/context/EventContext';
import { errorMessage, meApi, type SyncEvent } from '@/lib/api';

export const CALENDAR_LEGEND = [
  { key: 'going', label: 'Going', color: 'oklch(0.62 0.15 155)' },
  { key: 'waitlisted', label: 'Waitlisted', color: 'oklch(0.72 0.15 70)' },
  { key: 'organizing', label: 'Organizing', color: 'oklch(0.55 0.22 282)' },
  { key: 'personal', label: 'Personal', color: 'oklch(0.6 0.13 230)' },
  { key: 'cancelled', label: 'Cancelled', color: 'oklch(0.7 0.01 275)' },
] as const;

function toCalendarEvent(event: SyncEvent): EventInput {
  const key =
    event.status === 'cancelled'
      ? 'cancelled'
      : event.visibility === 'private'
        ? 'personal'
        : event.viewer.isOwner
          ? 'organizing'
          : event.viewer.registration === 'waitlisted'
            ? 'waitlisted'
            : 'going';
  const color = CALENDAR_LEGEND.find((l) => l.key === key)!.color;
  return {
    id: event.id,
    title: event.title,
    start: event.startsAt,
    end: event.endsAt,
    backgroundColor: color,
    borderColor: color,
    textColor: '#fff',
    classNames: key === 'cancelled' ? ['line-through', 'opacity-70'] : [],
  };
}

/** The user's own schedule: attending, waitlisted, organizing and personal events. */
export default function Calendar({ onSelectDate }: { onSelectDate?: (date: Date) => void }) {
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
    <div className="calendar-theme">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={loadEvents}
        eventClick={(info) => router.push(`/events/${info.event.id}`)}
        dateClick={onSelectDate ? (info) => onSelectDate(info.date) : undefined}
        headerToolbar={{ left: 'title', center: '', right: 'prev,today,next dayGridMonth,timeGridWeek' }}
        buttonText={{ today: 'Today', month: 'Month', week: 'Week' }}
        dayMaxEventRows={3}
        eventDisplay="block"
        height="auto"
      />
    </div>
  );
}
