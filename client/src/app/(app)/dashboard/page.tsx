'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, Compass, Megaphone, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEventsSync } from '@/context/EventContext';
import { adminApi, eventsApi, meApi, organizerApi, type OrganizerOverview, type PlatformStats, type SyncEvent } from '@/lib/api';
import { formatEventWhen, formatVenue, greeting } from '@/lib/format';
import EventCard, { EventCardSkeleton } from '@/components/events/EventCard';
import EventCover from '@/components/events/EventCover';
import { ButtonLink } from '@/components/ui/button';
import { Card, EmptyState } from '@/components/ui/surface';
import { Stagger, StaggerItem } from '@/components/ui/motion';

function SectionTitle({ icon, title, href, linkLabel }: { icon: React.ReactNode; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-semibold [&_svg]:size-5 [&_svg]:text-primary">
        {icon}
        {title}
      </h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground">
          {linkLabel} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

function UpNext({ events }: { events: SyncEvent[] }) {
  return (
    <Stagger className="grid gap-4 md:grid-cols-3">
      {events.map((event) => (
        <StaggerItem key={event.id}>
          <Link href={`/events/${event.id}`} className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lifted">
            <EventCover event={event} showDate={false} className="size-20 shrink-0 rounded-xl [&>span]:hidden" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary">{formatEventWhen(event)}</p>
              <p className="mt-0.5 truncate font-semibold">{event.title}</p>
              <p className="truncate text-sm text-muted">{formatVenue(event)}</p>
              {event.viewer.registration === 'waitlisted' && <p className="mt-1 text-xs font-medium text-warning">On the waitlist</p>}
            </div>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

function RoleShortcuts() {
  const { user } = useAuth();
  const [organizer, setOrganizer] = useState<OrganizerOverview['stats'] | null>(null);
  const [platform, setPlatform] = useState<PlatformStats | null>(null);

  useEffect(() => {
    if (user?.role === 'organizer' || user?.role === 'admin') organizerApi.overview().then((o) => setOrganizer(o.stats)).catch(() => {});
    if (user?.role === 'admin') adminApi.stats().then(setPlatform).catch(() => {});
  }, [user?.role]);

  if (!organizer && !platform) return null;

  return (
    <div className={`grid gap-4 ${organizer && platform ? 'md:grid-cols-2' : ''}`}>
      {organizer && (
        <Link href="/organizer" className="group">
          <Card className="flex items-center gap-4 p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-lifted">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
              <Megaphone className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Organizer console</p>
              <p className="text-sm text-muted">
                {organizer.upcomingEvents} upcoming · {organizer.totalRegistrations} registrations · {organizer.waitlisted} waitlisted
              </p>
            </div>
            <ArrowRight className="size-5 text-subtle transition group-hover:translate-x-1 group-hover:text-foreground" />
          </Card>
        </Link>
      )}
      {platform && (
        <Link href="/admin?tab=applications" className="group">
          <Card className="flex items-center gap-4 p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-lifted">
            <span className="flex size-11 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <ShieldCheck className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Admin</p>
              <p className="text-sm text-muted">
                {platform.pendingApplications} organizer request{platform.pendingApplications === 1 ? '' : 's'} to review · {platform.users.total} people
              </p>
            </div>
            <ArrowRight className="size-5 text-subtle transition group-hover:translate-x-1 group-hover:text-foreground" />
          </Card>
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { version } = useEventsSync();
  const [upNext, setUpNext] = useState<SyncEvent[] | null>(null);
  const [picked, setPicked] = useState<SyncEvent[] | null>(null);

  useEffect(() => {
    meApi
      .registrations(true)
      .then((items) => setUpNext(items.filter((e) => e.status !== 'cancelled').slice(0, 3)))
      .catch(() => setUpNext([]));
    eventsApi
      .recommended()
      .then(setPicked)
      .catch(() => setPicked([]));
  }, [version]);

  const replace = (updated: SyncEvent) => setPicked((prev) => prev?.map((e) => (e.id === updated.id ? updated : e)) ?? prev);

  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-soft sm:p-10">
        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-28 right-32 size-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-medium text-primary">{greeting()}</p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{user?.name.split(' ')[0]}, here&apos;s what&apos;s on.</h1>
          <p className="mt-2 max-w-xl text-muted">
            {upNext && upNext.length > 0
              ? `You have ${upNext.length === 1 ? 'one event' : `${upNext.length} events`} coming up. Find something new, or plan your own.`
              : 'Find something worth going to, or plan your own.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink href="/explore">
              <Compass /> Explore events
            </ButtonLink>
            <ButtonLink href="/schedule" variant="secondary">
              <CalendarCheck /> My schedule
            </ButtonLink>
          </div>
        </div>
      </div>

      <RoleShortcuts />

      <section>
        <SectionTitle icon={<Ticket />} title="Up next" href="/schedule" linkLabel="Schedule" />
        {upNext === null ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[104px] animate-pulse rounded-2xl bg-surface-muted" />
            ))}
          </div>
        ) : upNext.length ? (
          <UpNext events={upNext} />
        ) : (
          <EmptyState
            icon={<Ticket />}
            title="Nothing booked yet"
            description="RSVP to an event and it'll show up here, with reminders before it starts."
            action={<ButtonLink href="/explore" variant="secondary">Browse events</ButtonLink>}
          />
        )}
      </section>

      <section>
        <SectionTitle icon={<Sparkles />} title="Picked for you" href="/explore" linkLabel="See all" />
        {picked === null ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : picked.length ? (
          <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {picked.map((event) => (
              <StaggerItem key={event.id}>
                <EventCard event={event} onChange={replace} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState icon={<Sparkles />} title="You're all caught up" description="You've joined everything coming up. New events will appear here." />
        )}
        {picked && picked.length > 0 && !user?.interests.length && (
          <p className="mt-4 text-sm text-muted">
            Tip: pick your interests in{' '}
            <Link href="/settings" className="font-medium text-primary hover:underline">
              Settings
            </Link>{' '}
            to get better suggestions.
          </p>
        )}
      </section>
    </div>
  );
}
