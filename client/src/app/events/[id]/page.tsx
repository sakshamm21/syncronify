'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCalendarAlt, FaCalendarPlus, FaDirections, FaMapMarkerAlt, FaShareAlt, FaUsers, FaLink } from 'react-icons/fa';
import Navbar from '@/components/Navbar/Navbar';
import RsvpButton from '@/components/EventPage/RsvpButton';
import { EventCover } from '@/components/EventPage/EventCard';
import EventChat from '@/components/Chat/EventChat';
import { useAuth } from '@/context/AuthContext';
import { errorMessage, eventsApi, type SyncEvent } from '@/lib/api';
import { capacityLabel, formatEventWhen, formatVenue, ROLE_HOME } from '@/lib/format';

function directionsUrl(event: SyncEvent): string | null {
  const { latitude, longitude, name, address } = event.venue ?? {};
  if (latitude != null && longitude != null) return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const query = [name, address].filter(Boolean).join(', ');
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, status } = useAuth();
  const [event, setEvent] = useState<SyncEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    eventsApi
      .get(id)
      .then(setEvent)
      .catch((err) => setError(errorMessage(err)));
  }, [id, status]);

  async function share() {
    if (!event) return;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: event.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      // The user closed the share sheet.
    }
  }

  async function addToCalendar() {
    if (!event) return;
    try {
      await eventsApi.downloadCalendarFile(event);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const backHref = user ? ROLE_HOME[user.role] : '/';
  const directions = event && directionsUrl(event);

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <Link href={backHref} className="inline-flex items-center gap-2 text-xs font-black uppercase underline">
          <FaArrowLeft /> Back
        </Link>

        {error && (
          <div className="brutal-card bg-white border-4 border-black p-8 text-center">
            <p className="font-heading font-black text-2xl uppercase">Event not available</p>
            <p className="text-xs font-bold mt-2">{error}</p>
          </div>
        )}

        {!event && !error && <p className="text-xs font-bold">Loading event…</p>}

        {event && (
          <div className="grid lg:grid-cols-3 gap-6">
            <article className="lg:col-span-2 brutal-card bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000] space-y-5">
              <EventCover event={event} className="h-64" />
              <h1 className="font-heading font-black text-3xl uppercase tracking-tight leading-tight">{event.title}</h1>

              <div className="bg-[#F4F4F0] border-2 border-black p-4 space-y-2 text-sm font-bold">
                <p className="flex items-center gap-2">
                  <FaCalendarAlt className="text-[#FF007A]" /> {formatEventWhen(event)}
                </p>
                <p className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#00A3B0]" /> {formatVenue(event)}
                  {event.venue?.address && event.venue?.name && <span className="text-gray-600 font-medium">· {event.venue.address}</span>}
                </p>
                {event.onlineUrl && (
                  <p className="flex items-center gap-2">
                    <FaLink /> <a href={event.onlineUrl} target="_blank" rel="noreferrer" className="underline break-all">{event.onlineUrl}</a>
                  </p>
                )}
                {event.visibility === 'public' && (
                  <p className="flex items-center gap-2">
                    <FaUsers /> Hosted by {event.owner.organization || event.owner.name} · {capacityLabel(event)}
                  </p>
                )}
              </div>

              {event.description && <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{event.description}</p>}

              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span key={tag} className="brutal-badge bg-white text-black">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t-4 border-black flex flex-wrap items-center gap-3">
                <RsvpButton event={event} onChange={setEvent} className="px-6 py-2.5" />
                <button onClick={addToCalendar} className="brutal-btn bg-white text-black px-4 py-2 text-xs uppercase flex items-center gap-1.5">
                  <FaCalendarPlus /> Add to calendar
                </button>
                {directions && (
                  <a href={directions} target="_blank" rel="noreferrer" className="brutal-btn bg-white text-black px-4 py-2 text-xs uppercase flex items-center gap-1.5">
                    <FaDirections /> Directions
                  </a>
                )}
                {event.visibility === 'public' && (
                  <button onClick={share} className="brutal-btn bg-white text-black px-4 py-2 text-xs uppercase flex items-center gap-1.5">
                    <FaShareAlt /> Share
                  </button>
                )}
              </div>

              {event.viewer.registration === 'waitlisted' && (
                <p className="bg-[#FFE600] border-2 border-black p-3 text-xs font-bold">
                  You&apos;re on the waitlist. If a spot opens up you&apos;ll be moved in automatically and notified.
                </p>
              )}
            </article>

            {event.visibility === 'public' && (
              <aside className="brutal-card bg-white border-4 border-black p-4 shadow-[8px_8px_0px_#000] space-y-3 h-fit">
                <h2 className="font-heading font-black text-lg uppercase">Discussion</h2>
                {event.viewer.canChat ? (
                  <EventChat eventId={event.id} canAnnounce={event.viewer.canManage} />
                ) : (
                  <p className="text-xs font-bold bg-[#F4F4F0] border-2 border-black p-3">
                    {user
                      ? 'RSVP to join the conversation with the organizer and other attendees.'
                      : 'Sign in and RSVP to join the conversation.'}
                  </p>
                )}
              </aside>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
