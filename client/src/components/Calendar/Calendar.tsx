"use client"

import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FaCalendarAlt, FaPlus, FaFilter, FaRegClock } from 'react-icons/fa';

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

      <style jsx global>{`
        .fc {
          --fc-border-color: #000000;
          --fc-button-bg-color: #FFFFFF;
          --fc-button-border-color: #000000;
          --fc-button-text-color: #000000;
          --fc-button-hover-bg-color: #FFE600;
          --fc-button-hover-border-color: #000000;
          --fc-button-active-bg-color: #00F0FF;
          --fc-button-active-border-color: #000000;
          --fc-page-bg-color: #FFFFFF;
          --fc-today-bg-color: rgba(255, 230, 0, 0.25);
        }
        .fc .fc-toolbar-title {
          font-family: var(--font-space);
          font-weight: 900;
          text-transform: uppercase;
          font-size: 1.25rem;
        }
        .fc .fc-button {
          border: 2px solid #000000 !important;
          box-shadow: 2px 2px 0px #000000 !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 0.75rem !important;
          border-radius: 0px !important;
          padding: 0.4rem 0.8rem !important;
        }
        .fc .fc-button:active {
          box-shadow: 0px 0px 0px #000000 !important;
          transform: translate(2px, 2px);
        }
        .fc .fc-event {
          border: 2px solid #000000 !important;
          box-shadow: 2px 2px 0px #000000 !important;
          font-weight: 800 !important;
          padding: 2px 4px !important;
          border-radius: 0px !important;
        }
        .fc th {
          background: #F4F4F0;
          border: 2px solid #000000 !important;
          padding: 8px 0 !important;
          font-weight: 900 !important;
          text-transform: uppercase;
        }
        .fc td {
          border: 2px solid #000000 !important;
        }
      `}</style>
    </div>
  );
};

export default Calendar;