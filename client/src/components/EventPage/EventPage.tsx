'use client';

import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useEventsSync } from '@/context/EventContext';
import { errorMessage, eventsApi, type CategoryValue, type EventQuery, type SyncEvent } from '@/lib/api';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/format';
import EventCard from './EventCard';

const PAGE_SIZE = 12;

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Discovery hub: search, filter and RSVP to public events. */
export default function EventPage() {
  const { version } = useEventsSync();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryValue | null>(null);
  const [sort, setSort] = useState<NonNullable<EventQuery['sort']>>('soonest');
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const q = useDebounced(search.trim());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    eventsApi
      .list({ q: q || undefined, category: category ?? undefined, sort, page: 1, limit: PAGE_SIZE })
      .then(({ items, meta }) => {
        if (cancelled) return;
        setEvents(items);
        setTotal(meta.total);
        setPage(1);
        setError(null);
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [q, category, sort, version]);

  async function loadMore() {
    const next = page + 1;
    const { items } = await eventsApi.list({ q: q || undefined, category: category ?? undefined, sort, page: next, limit: PAGE_SIZE });
    setEvents((prev) => [...prev, ...items]);
    setPage(next);
  }

  const replaceEvent = (updated: SyncEvent) => setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

  return (
    <div className="space-y-6">
      <div className="brutal-card p-6 bg-white border-4 border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-[#FFE600] border-2 border-black flex items-center justify-center font-black">⚡</span>
            <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-black">Event Hub & Discovery</h2>
          </div>
          <p className="text-xs font-bold text-black mt-1">
            Explore campus and community events, RSVP in one click, and stay in sync.
          </p>
        </div>
        <span className="brutal-badge bg-[#00F0FF] text-black">{total} UPCOMING</span>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3.5 text-black text-xs" />
          <input
            type="search"
            placeholder="Search by title, venue or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search events"
            className="w-full bg-white border-2 border-black pl-10 pr-4 py-2.5 font-bold text-xs outline-none brutal-shadow-sm"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sort events"
          className="bg-white border-2 border-black px-3 py-2.5 font-black text-xs uppercase outline-none"
        >
          <option value="soonest">Soonest first</option>
          <option value="popular">Most popular</option>
          <option value="newest">Newly added</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[null, ...CATEGORIES].map((cat) => (
          <button
            key={cat ?? 'all'}
            onClick={() => setCategory(cat)}
            className={`brutal-btn text-[11px] px-3 py-1.5 uppercase whitespace-nowrap ${
              category === cat ? 'bg-[#FFE600] text-black' : 'bg-white text-black hover:bg-[#00F0FF]'
            }`}
          >
            {cat ? CATEGORY_LABELS[cat] : 'All'}
          </button>
        ))}
      </div>

      {error && <p className="bg-[#FF007A] text-white border-2 border-black p-3 text-xs font-bold">{error}</p>}

      {loading && events.length === 0 ? (
        <p className="text-xs font-bold">Loading events…</p>
      ) : events.length === 0 ? (
        <div className="brutal-card p-10 bg-white border-2 border-black text-center">
          <p className="font-heading font-bold text-lg">No events match yet</p>
          <p className="text-xs font-medium mt-1">Try another category or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onChange={replaceEvent} />
          ))}
        </div>
      )}

      {events.length < total && (
        <div className="flex justify-center">
          <button onClick={loadMore} className="brutal-btn bg-white text-black px-6 py-2.5 text-xs font-black uppercase">
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
