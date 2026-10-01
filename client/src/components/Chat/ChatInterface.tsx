'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTimes, FaComments } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useEventsSync } from '@/context/EventContext';
import { meApi, organizerApi, type SyncEvent } from '@/lib/api';
import { formatDay } from '@/lib/format';
import EventChat from './EventChat';

interface ChatInterfaceProps {
  onClose?: () => void;
  inline?: boolean;
}

/** Channel list (one per upcoming event you're part of) plus the selected discussion. */
export default function ChatInterface({ onClose, inline = false }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { version } = useEventsSync();
  const [channels, setChannels] = useState<SyncEvent[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';
    Promise.all([
      meApi.registrations(true),
      isOrganizer ? organizerApi.overview().then((o) => o.events.filter((e) => !e.isPast)) : Promise.resolve([]),
    ])
      .then(([joined, organized]) => {
        const all = [...organized, ...joined].filter((e) => e.viewer.canChat);
        const unique = all.filter((e, i) => all.findIndex((x) => x.id === e.id) === i);
        unique.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        setChannels(unique);
        setActiveId((current) => current ?? unique[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, [user?.role, version]);

  const active = channels.find((c) => c.id === activeId);

  return (
    <div
      className={`brutal-card bg-white border-4 border-black shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden ${
        inline ? 'w-full h-[640px]' : 'fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-lg h-[600px]'
      }`}
    >
      <div className="bg-[#FFE600] border-b-4 border-black p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center">
            <FaComments />
          </div>
          <div>
            <h3 className="font-heading font-black text-base uppercase tracking-tight">Event Chat</h3>
            <p className="text-[10px] font-bold uppercase">{active ? active.title : 'Talk with organizers and attendees'}</p>
          </div>
        </div>
        {onClose && !inline && (
          <button onClick={onClose} aria-label="Close chat" className="brutal-btn bg-[#FF007A] text-white p-1 text-xs">
            <FaTimes />
          </button>
        )}
      </div>

      {loading ? (
        <p className="p-4 text-xs font-bold">Loading your events…</p>
      ) : channels.length === 0 ? (
        <div className="p-6 text-center space-y-2">
          <p className="font-heading font-black text-lg uppercase">No chats yet</p>
          <p className="text-xs font-bold">RSVP to an event to join its discussion with the organizer and other attendees.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row min-h-0">
          <nav className="sm:w-48 border-b-2 sm:border-b-0 sm:border-r-2 border-black bg-[#F4F4F0] flex sm:flex-col overflow-x-auto sm:overflow-y-auto">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveId(channel.id)}
                className={`text-left p-3 border-b border-black text-xs font-bold shrink-0 w-44 sm:w-auto ${
                  channel.id === activeId ? 'bg-[#00F0FF]' : 'hover:bg-white'
                }`}
              >
                <span className="block truncate font-black">{channel.title}</span>
                <span className="text-[10px] text-gray-600">{formatDay(channel.startsAt)}</span>
              </button>
            ))}
          </nav>
          {active && (
            <div className="flex-1 flex flex-col min-h-0">
              <EventChat key={active.id} eventId={active.id} canAnnounce={active.viewer.canManage} className="flex-1 min-h-0 border-0" />
              <Link href={`/events/${active.id}`} className="text-[11px] font-bold underline p-2 border-t-2 border-black bg-white">
                View event details →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
