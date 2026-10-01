'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useEventsSync } from '@/context/EventContext';
import { errorMessage, eventsApi, type CategoryValue, type EventQuery, type SyncEvent } from '@/lib/api';
import { CATEGORIES, CATEGORY_EMOJI, CATEGORY_LABELS } from '@/lib/format';
import EventCard, { EventCardSkeleton } from '@/components/events/EventCard';
import { Button } from '@/components/ui/button';
import { EmptyState, PageHeader } from '@/components/ui/surface';
import { FilterChips, Segmented } from '@/components/ui/tabs';
import { FormAlert } from '@/components/ui/field';
import { Stagger, StaggerItem } from '@/components/ui/motion';

const PAGE_SIZE = 12;
type Sort = NonNullable<EventQuery['sort']>;

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function Explore() {
  const params = useSearchParams();
  const router = useRouter();
  const { version } = useEventsSync();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState<CategoryValue | null>((params.get('category') as CategoryValue) || null);
  const [sort, setSort] = useState<Sort>('soonest');
  const [events, setEvents] = useState<SyncEvent[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const q = useDebounced(search.trim());

  // The top bar search navigates here with ?q=…
  useEffect(() => {
    setSearch(params.get('q') ?? '');
  }, [params]);

  useEffect(() => {
    let cancelled = false;
    eventsApi
      .list({ q: q || undefined, category: category ?? undefined, sort, page: 1, limit: PAGE_SIZE })
      .then(({ items, meta }) => {
        if (cancelled) return;
        setEvents(items);
        setTotal(meta.total);
        setPage(1);
        setError(null);
      })
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [q, category, sort, version]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const { items } = await eventsApi.list({ q: q || undefined, category: category ?? undefined, sort, page: next, limit: PAGE_SIZE });
      setEvents((prev) => [...(prev ?? []), ...items]);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  }

  const replace = (updated: SyncEvent) => setEvents((prev) => prev?.map((e) => (e.id === updated.id ? updated : e)) ?? prev);

  return (
    <>
      <PageHeader kicker="Everything coming up on campus" title={<>Explore the <em>good stuff</em></>} description="Search it, filter it, tap I’m in. That’s it." />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-primary" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="hackathon, open mic, football…"
              aria-label="Search events"
              className="h-14 w-full rounded-full border border-border bg-surface pl-12 pr-4 font-display text-lg font-semibold outline-none transition placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-subtle hover:border-border-strong focus:border-primary focus:ring-4 focus:ring-ring/25"
            />
          </div>
          <Segmented<Sort>
            value={sort}
            onChange={setSort}
            options={[
              { value: 'soonest', label: 'Soonest' },
              { value: 'popular', label: 'Trending 🔥' },
              { value: 'newest', label: 'New' },
            ]}
          />
        </div>
        <FilterChips<CategoryValue>
          value={category}
          onChange={setCategory}
          options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c], emoji: CATEGORY_EMOJI[c] }))}
        />
      </div>

      <FormAlert message={error} />

      {events === null ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="Nothing matches… yet"
          description={q || category ? 'Try a different search or category.' : 'Nothing is scheduled yet. Check back soon.'}
          action={
            (q || category) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setCategory(null);
                  router.replace('/explore');
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-muted">
            {total} event{total === 1 ? '' : 's'}
          </p>
          <Stagger key={`${q}-${category}-${sort}`} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <StaggerItem key={event.id}>
                <EventCard event={event} onChange={replace} />
              </StaggerItem>
            ))}
          </Stagger>
          {events.length < total && (
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" loading={loadingMore} onClick={loadMore}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <Explore />
    </Suspense>
  );
}
