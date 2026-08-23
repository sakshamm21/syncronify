"use client"

import './Calendar.css';
import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FaCalendarAlt, FaRegClock } from 'react-icons/fa';

interface CalendarProps {
  onSelectDate?: (date: Date) => void;
  events?: any[];
}

const Calendar: React.FC<CalendarProps> = ({ onSelectDate, events: externalEvents }) => {
  const calendarRef = useRef<FullCalendar | null>(null);

  const defaultEvents = [
    {
      id: "ev-1",
      title: "⚡ Tech Summit 2026",
      start: new Date(new Date().setDate(new Date().getDate() + 1)),
      end: new Date(new Date().setDate(new Date().getDate() + 1)),
      backgroundColor: "#FFE600",
      textColor: "#000000",
      borderColor: "#000000",
    },
    {
      id: "ev-2",
      title: "🎨 Neo-Brutalist Design Sprint",
      start: new Date(new Date().setDate(new Date().getDate() + 3)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
      backgroundColor: "#00F0FF",
      textColor: "#000000",
      borderColor: "#000000",
    },
    {
      id: "ev-3",
      title: "🚀 Open Source Community Meetup",
      start: new Date(new Date().setDate(new Date().getDate() + 7)),
      end: new Date(new Date().setDate(new Date().getDate() + 7)),
      backgroundColor: "#FF007A",
      textColor: "#FFFFFF",
      borderColor: "#000000",
    },
  ];

  const [events, setEvents] = useState<any[]>(externalEvents || defaultEvents);

  const handleEventClick = (info: any) => {
    alert(`📅 Event: ${info.event.title}\nStart: ${info.event.start?.toLocaleString()}`);
  };

  return (
    <div className="brutal-card p-6 bg-white border-4 border-black shadow-[8px_8px_0px_#000] space-y-4">
      {/* Brutalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-[#FFE600] border-2 border-black flex items-center justify-center font-black text-xl brutal-shadow-sm">
            <FaCalendarAlt />
          </span>
          <div>
            <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-black">
              Event Calendar & Timeline
            </h2>
            <p className="text-xs font-bold text-black uppercase">
              Interactive Schedule Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="brutal-badge bg-[#00FF66] text-black flex items-center gap-1">
            <FaRegClock /> LIVE SYNC
          </span>
        </div>
      </div>

      {/* Calendar Styling Container */}
      <div className="brutal-calendar-wrap font-bold text-xs">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          height="auto"
        />
      </div>
    </div>
  );
};

export default Calendar;