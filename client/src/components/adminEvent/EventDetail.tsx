'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCheckCircle, FaRegCircle, FaDownload, FaSearch } from 'react-icons/fa';
import Navbar from '@/components/Navbar/Navbar';
import EventChat from '@/components/Chat/EventChat';
import { errorMessage, eventsApi, type Attendee, type AttendeeList, type SyncEvent } from '@/lib/api';
import { capacityLabel, formatDateTime, formatEventWhen, formatVenue } from '@/lib/format';

function downloadCsv(event: SyncEvent, attendees: Attendee[]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    ['Name', 'Email', 'Status', 'Registered at', 'Checked in at'],
    ...attendees.map((a) => [
      a.user?.name ?? '',
      a.user?.email ?? '',
      a.status,
      a.registeredAt,
      a.checkedInAt ?? '',
    ]),
  ];
  const blob = new Blob([rows.map((r) => r.map(escape).join(',')).join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-attendees.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Organiser view of one event: attendees, check-in and announcements. */
export default function EventManagement({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<SyncEvent | null>(null);
  const [list, setList] = useState<AttendeeList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    Promise.all([eventsApi.get(eventId), eventsApi.attendees(eventId)])
      .then(([e, a]) => {
        setEvent(e);
        setList(a);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [eventId]);

  useEffect(load, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!list) return [];
    return q ? list.items.filter((a) => `${a.user?.name} ${a.user?.email}`.toLowerCase().includes(q)) : list.items;
  }, [list, search]);

  async function toggleCheckIn(attendee: Attendee) {
    if (!attendee.user) return;
    const checkedIn = !attendee.checkedInAt;
    try {
      const { checkedInAt } = await eventsApi.setCheckIn(eventId, attendee.user.id, checkedIn);
      setList((prev) =>
        prev && {
          items: prev.items.map((a) => (a.id === attendee.id ? { ...a, checkedInAt } : a)),
          counts: { ...prev.counts, checkedIn: prev.counts.checkedIn + (checkedIn ? 1 : -1) },
        }
      );
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <Link href="/admin-dashboard" className="inline-flex items-center gap-2 text-xs font-black uppercase underline">
          <FaArrowLeft /> Organizer Console
        </Link>

        {error && <p className="bg-[#FF007A] text-white border-2 border-black p-4 text-sm font-bold">{error}</p>}
        {!event && !error && <p className="text-xs font-bold">Loading…</p>}

        {event && list && (
          <>
            <header className="brutal-card bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
              <h1 className="font-heading font-black text-3xl uppercase">{event.title}</h1>
              <p className="text-sm font-bold mt-1">
                {formatEventWhen(event)} · {formatVenue(event)} · {capacityLabel(event)}
              </p>
              {event.status === 'cancelled' && <p className="brutal-badge bg-[#FF007A] text-white mt-2 inline-block">Cancelled</p>}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: 'Going', value: list.counts.going },
                  { label: 'Waitlisted', value: list.counts.waitlisted },
                  { label: 'Checked in', value: list.counts.checkedIn },
                ].map((s) => (
                  <div key={s.label} className="border-2 border-black p-3 text-center bg-[#F4F4F0]">
                    <p className="font-heading font-black text-2xl">{s.value}</p>
                    <p className="text-[11px] font-black uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            </header>

            <div className="grid lg:grid-cols-5 gap-6">
              <section className="lg:col-span-3 brutal-card bg-white border-4 border-black p-5 shadow-[6px_6px_0px_#000] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="font-heading font-black text-xl uppercase">Attendees</h2>
                  <button
                    onClick={() => downloadCsv(event, list.items)}
                    disabled={list.items.length === 0}
                    className="brutal-btn bg-white px-3 py-2 text-xs font-black uppercase flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <FaDownload /> Export CSV
                  </button>
                </div>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-xs" />
                  <input
                    type="search"
                    placeholder="Find by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search attendees"
                    className="w-full bg-[#F4F4F0] border-2 border-black pl-9 pr-3 py-2 text-xs font-bold outline-none"
                  />
                </div>

                {visible.length === 0 ? (
                  <p className="text-xs font-bold text-gray-600 py-6 text-center">
                    {list.items.length === 0 ? 'No registrations yet. Share the event link to get RSVPs.' : 'No one matches that search.'}
                  </p>
                ) : (
                  <ul className="divide-y-2 divide-black border-2 border-black">
                    {visible.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 p-3 bg-white">
                        <div className="min-w-0">
                          <p className="text-sm font-black truncate">{a.user?.name ?? 'Deleted user'}</p>
                          <p className="text-[11px] font-bold text-gray-600 truncate">{a.user?.email}</p>
                          <p className="text-[10px] font-bold text-gray-500">Registered {formatDateTime(a.registeredAt)}</p>
                        </div>
                        {a.status === 'waitlisted' ? (
                          <span className="brutal-badge bg-[#FFE600] text-black shrink-0">Waitlisted</span>
                        ) : (
                          <button
                            onClick={() => toggleCheckIn(a)}
                            className={`brutal-btn px-3 py-1.5 text-[11px] font-black uppercase flex items-center gap-1.5 shrink-0 ${
                              a.checkedInAt ? 'bg-[#00FF66]' : 'bg-white'
                            }`}
                          >
                            {a.checkedInAt ? <FaCheckCircle /> : <FaRegCircle />}
                            {a.checkedInAt ? 'Checked in' : 'Check in'}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="lg:col-span-2 brutal-card bg-white border-4 border-black p-5 shadow-[6px_6px_0px_#000] space-y-3">
                <h2 className="font-heading font-black text-xl uppercase">Announcements & Chat</h2>
                <p className="text-[11px] font-bold text-gray-600">
                  Tick &quot;announcement&quot; to notify every attendee (in-app and by email).
                </p>
                {event.viewer.canChat ? (
                  <EventChat eventId={event.id} canAnnounce />
                ) : (
                  <p className="text-xs font-bold">Chat opens once the event is published.</p>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
