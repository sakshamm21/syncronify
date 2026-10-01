'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, CalendarPlus, Clock, Hourglass, Link2, MapPin, MessagesSquare, Navigation, Share2, Users } from 'lucide-react';
import PublicHeader from '@/components/shell/PublicHeader';
import RsvpButton from '@/components/events/RsvpButton';
import EventCover from '@/components/events/EventCover';
import { CapacityBar } from '@/components/events/EventCard';
import EventChat from '@/components/chat/EventChat';
import { useAuth } from '@/context/AuthContext';
import { errorMessage, eventsApi, type SyncEvent } from '@/lib/api';
import { CATEGORY_LABELS, formatEventWhen, formatVenue } from '@/lib/format';
import { Button, ButtonLink } from '@/components/ui/button';
import { Avatar, Badge, Card, EmptyState } from '@/components/ui/surface';
import { FadeIn } from '@/components/ui/motion';

function directionsUrl(event: SyncEvent): string | null {
  const { latitude, longitude, name, address } = event.venue ?? {};
  if (latitude != null && longitude != null) return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const query = [name, address].filter(Boolean).join(', ');
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}

function mapEmbed(event: SyncEvent): string | null {
  const { latitude: lat, longitude: lng } = event.venue ?? {};
  if (lat == null || lng == null) return null;
  const d = 0.004;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function Detail({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted [&_svg]:size-4">{icon}</span>
      <div className="min-w-0 flex-1 pt-1.5">{children}</div>
    </div>
  );
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, status } = useAuth();
  const [event, setEvent] = useState<SyncEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    eventsApi.get(id).then(setEvent).catch((err) => setError(errorMessage(err)));
  }, [id, status]);

  async function share() {
    if (!event) return;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: event.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
    } catch {
      // The share sheet was closed.
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

  const directions = event && directionsUrl(event);
  const embed = event && mapEmbed(event);
  const host = event ? event.owner.organization || event.owner.name : '';

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button onClick={() => (window.history.length > 1 ? router.back() : router.push(user ? '/explore' : '/'))} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </button>

        {error && <EmptyState icon={<Clock />} title="This event isn't available" description={error} action={<ButtonLink href="/explore" variant="secondary">Explore events</ButtonLink>} />}

        {!event && !error && (
          <div className="space-y-6">
            <div className="aspect-[21/9] animate-pulse rounded-3xl bg-surface-muted" />
            <div className="h-10 w-2/3 animate-pulse rounded-xl bg-surface-muted" />
          </div>
        )}

        {event && (
          <FadeIn>
            <EventCover event={event} showDate={false} className="aspect-[16/9] rounded-3xl sm:aspect-[3/1]" />

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
              <div className="min-w-0 space-y-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary">{CATEGORY_LABELS[event.category]}</Badge>
                    {event.visibility === 'private' && <Badge>Personal</Badge>}
                    {event.status === 'cancelled' && <Badge tone="danger">Cancelled</Badge>}
                    {event.status === 'draft' && <Badge>Draft</Badge>}
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{event.title}</h1>
                  {event.visibility === 'public' && (
                    <div className="mt-4 flex items-center gap-2.5 text-sm text-muted">
                      <Avatar name={host} src={event.owner.avatarUrl} size={28} />
                      Hosted by <span className="font-medium text-foreground">{host}</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <section>
                    <h2 className="mb-2 text-lg font-semibold">About</h2>
                    <p className="whitespace-pre-wrap leading-relaxed text-muted">{event.description}</p>
                  </section>
                )}

                {event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Link key={tag} href={`/explore?q=${encodeURIComponent(tag)}`} className="rounded-full border border-border px-3 py-1 text-sm text-muted transition hover:border-border-strong hover:text-foreground">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                {embed && (
                  <section>
                    <h2 className="mb-3 text-lg font-semibold">Location</h2>
                    <div className="overflow-hidden rounded-2xl border border-border">
                      <iframe title="Venue map" src={embed} className="h-64 w-full border-0" />
                    </div>
                  </section>
                )}

                {event.visibility === 'public' && (
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                      <MessagesSquare className="size-5 text-primary" /> Discussion
                    </h2>
                    {event.viewer.canChat ? (
                      <Card className="flex h-[520px] flex-col overflow-hidden">
                        <EventChat eventId={event.id} canAnnounce={event.viewer.canManage} className="flex-1" />
                      </Card>
                    ) : (
                      <Card className="p-6 text-center text-sm text-muted">
                        {user ? 'RSVP to join the conversation with the organizer and everyone going.' : 'Sign in and RSVP to join the conversation.'}
                      </Card>
                    )}
                  </section>
                )}
              </div>

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <Card className="space-y-5 p-5">
                  <Detail icon={<Clock />}>
                    <p className="font-medium">{formatEventWhen(event)}</p>
                  </Detail>
                  <Detail icon={<MapPin />}>
                    <p className="font-medium">{formatVenue(event)}</p>
                    {event.venue?.address && event.venue?.name && <p className="truncate text-muted">{event.venue.address}</p>}
                  </Detail>
                  {event.onlineUrl && (
                    <Detail icon={<Link2 />}>
                      <a href={event.onlineUrl} target="_blank" rel="noreferrer" className="break-all font-medium text-primary hover:underline">
                        Join online
                      </a>
                    </Detail>
                  )}
                  {event.visibility === 'public' && (
                    <Detail icon={<Users />}>
                      <CapacityBar event={event} />
                    </Detail>
                  )}

                  {event.viewer.registration === 'waitlisted' && (
                    <p className="flex gap-2 rounded-xl bg-warning-soft p-3 text-sm text-warning">
                      <Hourglass className="mt-0.5 size-4 shrink-0" />
                      You&apos;re on the waitlist. If a spot opens you&apos;ll be moved in and notified.
                    </p>
                  )}

                  <RsvpButton event={event} onChange={setEvent} size="lg" className="w-full" />

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="secondary" size="sm" onClick={addToCalendar} className="flex-col gap-1 py-6">
                      <CalendarPlus /> <span className="text-[11px]">Calendar</span>
                    </Button>
                    <Button variant="secondary" size="sm" onClick={share} disabled={event.visibility !== 'public'} className="flex-col gap-1 py-6">
                      <Share2 /> <span className="text-[11px]">Share</span>
                    </Button>
                    {directions ? (
                      <a href={directions} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-surface py-1.5 text-xs font-medium shadow-soft transition hover:bg-surface-muted [&_svg]:size-4">
                        <Navigation /> <span className="text-[11px]">Directions</span>
                      </a>
                    ) : (
                      <Button variant="secondary" size="sm" disabled className="flex-col gap-1 py-6">
                        <Navigation /> <span className="text-[11px]">Directions</span>
                      </Button>
                    )}
                  </div>
                </Card>
              </aside>
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  );
}
