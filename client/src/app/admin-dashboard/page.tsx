'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
  FaCalendarPlus,
  FaTrash,
  FaEdit,
  FaShieldAlt,
  FaBan,
  FaUsers,
  FaLayerGroup,
  FaCalendarAlt,
  FaStickyNote,
  FaMapMarkedAlt,
  FaComments,
} from 'react-icons/fa';
import Navbar from '@/components/Navbar/Navbar';
import SideBar, { type SidebarTab } from '@/components/Sidebar/Sidebar';
import CreateEvent from '@/components/CreateEvent/CreateEvent';
import Calendar from '@/components/Calendar/Calendar';
import NotesManager from '@/components/Notes/NotesManager';
import ChatInterface from '@/components/Chat/ChatInterface';
import { useEventsSync } from '@/context/EventContext';
import { errorMessage, eventsApi, organizerApi, type OrganizedEvent, type OrganizerOverview, type SyncEvent } from '@/lib/api';
import { CATEGORY_LABELS, formatEventWhen, formatVenue } from '@/lib/format';

const BrowseMap = dynamic(() => import('@/components/MapBox/BrowseMap'), { ssr: false });

const ORGANIZER_TABS: SidebarTab[] = [
  { id: 'events', name: 'My Events', icon: <FaLayerGroup /> },
  { id: 'calendar', name: 'Schedule', icon: <FaCalendarAlt /> },
  { id: 'notes', name: 'Notes & Plans', icon: <FaStickyNote /> },
  { id: 'map', name: 'Venue Map', icon: <FaMapMarkedAlt /> },
  { id: 'chat', name: 'Event Chats', icon: <FaComments /> },
];

function statusBadge(event: OrganizedEvent) {
  if (event.status === 'cancelled') return <span className="brutal-badge bg-[#FF007A] text-white">Cancelled</span>;
  if (event.status === 'draft') return <span className="brutal-badge bg-white text-black">Draft</span>;
  if (event.isPast) return <span className="brutal-badge bg-[#D4D4D4] text-black">Ended</span>;
  return <span className="brutal-badge bg-[#00FF66] text-black">Live</span>;
}

export default function OrganizerDashboard() {
  const { version, eventsChanged } = useEventsSync();
  const [activeTab, setActiveTab] = useState('events');
  const [overview, setOverview] = useState<OrganizerOverview | null>(null);
  const [editor, setEditor] = useState<{ open: boolean; event: SyncEvent | null; date: Date | null }>({ open: false, event: null, date: null });
  const [isMapModalActive, setIsMapModalActive] = useState(false);

  const load = useCallback(() => {
    organizerApi
      .overview()
      .then(setOverview)
      .catch((err) => toast.error(errorMessage(err)));
  }, []);

  useEffect(load, [load, version]);

  const openEditor = (event: SyncEvent | null = null, date: Date | null = null) => setEditor({ open: true, event, date });
  const toggleMap = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setIsMapModalActive((open) => !open);
  };

  async function cancelEvent(event: OrganizedEvent) {
    const reason = window.prompt(
      `Cancel "${event.title}"? ${event.stats.going + event.stats.waitlisted} registered people will be notified.\n\nOptional message to attendees:`
    );
    if (reason === null) return;
    try {
      await eventsApi.cancel(event.id, reason);
      toast.success('Event cancelled and attendees notified');
      eventsChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function deleteEvent(event: OrganizedEvent) {
    if (!window.confirm(`Permanently delete "${event.title}"? Registrations and chat history will be removed.`)) return;
    try {
      await eventsApi.remove(event.id);
      toast.success('Event deleted');
      eventsChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const stats = overview?.stats;
  const statCards = [
    { label: 'Upcoming events', value: stats?.upcomingEvents },
    { label: 'Registrations', value: stats?.totalRegistrations },
    { label: 'On waitlists', value: stats?.waitlisted },
    { label: 'Attendance rate', value: stats ? (stats.attendanceRate == null ? '—' : `${stats.attendanceRate}%`) : undefined },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans selection:bg-[#FFE600] flex flex-col">
      <Navbar onOpenCreateEvent={() => openEditor()} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        <SideBar activeTab={activeTab} setActiveTab={setActiveTab} tabs={ORGANIZER_TABS} />

        <main className="flex-1 space-y-6 min-w-0">
          <div className="brutal-card bg-[#00F0FF] border-4 border-black p-6 shadow-[8px_8px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-white flex items-center justify-center">
                  <FaShieldAlt />
                </span>
                <h1 className="font-heading font-black text-2xl uppercase tracking-tight">Organizer Console</h1>
              </div>
              <p className="text-xs font-bold mt-1">Publish events, manage RSVPs and waitlists, check people in, and keep attendees updated.</p>
            </div>
            <button onClick={() => openEditor()} className="brutal-btn bg-[#FFE600] px-6 py-3 text-xs font-black uppercase flex items-center gap-2">
              <FaCalendarPlus /> Post Event
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="brutal-card bg-white border-2 border-black p-4 text-center">
                <p className="font-heading font-black text-3xl">{card.value ?? '…'}</p>
                <p className="text-[11px] font-black uppercase mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {activeTab === 'events' && (
            <section className="brutal-card bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]">
              <h2 className="font-heading font-black text-xl uppercase border-b-2 border-black pb-3 mb-4">Your Events</h2>
              {!overview ? (
                <p className="text-xs font-bold">Loading…</p>
              ) : overview.events.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="font-heading font-black text-lg uppercase">No events yet</p>
                  <button onClick={() => openEditor()} className="brutal-btn bg-[#00FF66] px-5 py-2.5 text-xs font-black uppercase">
                    Post your first event
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {overview.events.map((event) => (
                    <li key={event.id} className="bg-[#F4F4F0] border-2 border-black p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {statusBadge(event)}
                          <span className="brutal-badge bg-[#FFE600] text-black">{CATEGORY_LABELS[event.category]}</span>
                        </div>
                        <Link href={`/events/${event.id}`} className="block font-heading font-black text-lg hover:underline truncate">
                          {event.title}
                        </Link>
                        <p className="text-xs font-bold">
                          {formatEventWhen(event)} · {formatVenue(event)}
                        </p>
                        <p className="text-xs font-bold text-gray-700">
                          {event.stats.going}
                          {event.capacity ? `/${event.capacity}` : ''} going · {event.stats.waitlisted} waitlisted · {event.stats.checkedIn} checked in
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/admin-dashboard/${event.id}`} className="brutal-btn bg-[#00F0FF] px-3 py-2 text-xs font-black uppercase flex items-center gap-1">
                          <FaUsers /> Attendees
                        </Link>
                        {event.status !== 'cancelled' && (
                          <button onClick={() => openEditor(event)} aria-label="Edit" title="Edit" className="brutal-btn bg-white p-2 text-xs">
                            <FaEdit />
                          </button>
                        )}
                        {event.status === 'published' && !event.isPast && (
                          <button onClick={() => cancelEvent(event)} aria-label="Cancel event" title="Cancel event" className="brutal-btn bg-[#FFE600] p-2 text-xs">
                            <FaBan />
                          </button>
                        )}
                        <button onClick={() => deleteEvent(event)} aria-label="Delete" title="Delete" className="brutal-btn bg-[#FF007A] text-white p-2 text-xs">
                          <FaTrash />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          {activeTab === 'calendar' && <Calendar onSelectDate={(date) => openEditor(null, date)} />}
          {activeTab === 'notes' && <NotesManager />}
          {activeTab === 'map' && (
            <div className="h-[600px]">
              <BrowseMap />
            </div>
          )}
          {activeTab === 'chat' && <ChatInterface inline />}
        </main>
      </div>

      <CreateEvent
        isCreateActive={editor.open}
        handleCreateActive={(open) => setEditor((prev) => ({ ...prev, open }))}
        handleBrowseMap={toggleMap}
        event={editor.event}
        initialDate={editor.date}
      />

      {isMapModalActive && (
        <div className="fixed inset-0 z-[60] bg-black/80 p-6 flex items-center justify-center">
          <div className="w-full max-w-4xl h-[90vh]">
            <BrowseMap handleBrowseMap={toggleMap} />
          </div>
        </div>
      )}
    </div>
  );
}
