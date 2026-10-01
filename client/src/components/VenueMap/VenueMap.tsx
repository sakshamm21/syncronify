'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FaSearch, FaCheck, FaTimes, FaCompass, FaMapMarkerAlt } from 'react-icons/fa';
import { eventsApi, type Venue, type VenueSummary } from '@/lib/api';
import { formatDay, formatTime } from '@/lib/format';
import { usePlaceSearch } from './usePlaceSearch';

export interface PickedLocation extends Required<Pick<Venue, 'latitude' | 'longitude'>> {
  name: string;
  address: string;
}

interface VenueMapProps {
  /** When set, the map works as a picker and offers "Use this location". */
  onPick?: (location: PickedLocation) => void;
  onClose?: () => void;
}

// Shown before anything is selected; the first venue with events replaces it.
const DEFAULT_CENTER = { latitude: 26.5123, longitude: 80.2329 };

function osmEmbedUrl(lat: number, lng: number) {
  const d = 0.008;
  const bbox = [lng - d, lat - d, lng + d, lat + d].join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

/** Map of venues used by upcoming events, plus place search (OpenStreetMap). */
export default function VenueMap({ onPick, onClose }: VenueMapProps) {
  const [venues, setVenues] = useState<VenueSummary[] | null>(null);
  const [selected, setSelected] = useState<PickedLocation | null>(null);
  const [query, setQuery] = useState('');
  const { results, searching, error, clear } = usePlaceSearch(query);

  useEffect(() => {
    eventsApi
      .venues()
      .then((list) => {
        setVenues(list);
        setSelected((current) => current ?? (list[0] ? { name: list[0].name, address: list[0].address, latitude: list[0].latitude, longitude: list[0].longitude } : null));
      })
      .catch(() => setVenues([]));
  }, []);

  const center = selected ?? DEFAULT_CENTER;
  const eventsHere = useMemo(
    () => venues?.find((v) => selected && v.latitude === selected.latitude && v.longitude === selected.longitude)?.events ?? [],
    [venues, selected]
  );

  const choose = (location: PickedLocation) => {
    setSelected(location);
    setQuery('');
    clear();
  };

  return (
    <div className="brutal-card w-full h-full bg-white border-4 border-black p-4 shadow-[8px_8px_0px_#000] flex flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between border-b-4 border-black pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-[#00F0FF] border-2 border-black flex items-center justify-center">
            <FaCompass />
          </span>
          <h3 className="font-heading font-black text-lg uppercase tracking-tight">{onPick ? 'Pick a Venue' : 'Venue Map'}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close map" className="brutal-btn bg-[#FF007A] text-white p-1.5 text-xs">
            <FaTimes />
          </button>
        )}
      </div>

      <div className="relative z-20">
        <FaSearch className="absolute left-3 top-3 text-xs" />
        <input
          type="search"
          placeholder="Search any place, e.g. “Outreach Auditorium Kanpur”"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search places"
          className="w-full bg-[#F4F4F0] border-2 border-black pl-9 pr-3 py-2 font-bold text-xs outline-none"
        />
        {(results.length > 0 || searching || error) && query.trim().length >= 3 && (
          <ul className="absolute top-10 left-0 right-0 bg-white border-2 border-black max-h-48 overflow-y-auto">
            {searching && <li className="p-2 text-xs font-bold">Searching…</li>}
            {!searching && error && <li className="p-2 text-xs font-bold text-gray-600">{error}</li>}
            {results.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => choose(place)}
                  className="w-full text-left p-2 text-xs border-b border-black hover:bg-[#FFE600]"
                >
                  <span className="font-black">{place.name}</span>
                  <span className="block text-[11px] text-gray-600 truncate">{place.address}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1 min-h-[320px] flex flex-col md:flex-row border-2 border-black overflow-hidden">
        <div className="flex-1 relative bg-[#e5e3df] min-h-[260px]">
          <iframe
            title="Map"
            src={osmEmbedUrl(center.latitude, center.longitude)}
            className="absolute inset-0 w-full h-full border-none"
          />
          {selected && (
            <div className="absolute left-3 bottom-3 bg-white/95 border-2 border-black p-3 max-w-xs">
              <p className="text-xs font-black flex items-center gap-1">
                <FaMapMarkerAlt className="text-[#FF007A]" /> {selected.name}
              </p>
              {selected.address && <p className="text-[11px] font-medium truncate">{selected.address}</p>}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold underline"
              >
                Directions →
              </a>
            </div>
          )}
        </div>

        <aside className="w-full md:w-72 bg-white border-t-2 md:border-t-0 md:border-l-2 border-black p-3 flex flex-col gap-3 overflow-y-auto">
          <div>
            <h4 className="font-heading font-black text-xs uppercase border-b border-black pb-1 mb-2">Venues with upcoming events</h4>
            {venues === null && <p className="text-xs font-bold">Loading…</p>}
            {venues?.length === 0 && <p className="text-xs font-bold text-gray-600">No upcoming events have a map location yet.</p>}
            <div className="space-y-2">
              {venues?.map((v) => {
                const active = selected?.latitude === v.latitude && selected?.longitude === v.longitude;
                return (
                  <button
                    key={`${v.name}-${v.latitude}-${v.longitude}`}
                    type="button"
                    onClick={() => choose({ name: v.name, address: v.address, latitude: v.latitude, longitude: v.longitude })}
                    className={`w-full text-left p-2 border border-black text-xs font-bold ${active ? 'bg-[#FFE600]' : 'bg-[#F4F4F0] hover:bg-[#00F0FF]'}`}
                  >
                    <span className="block truncate">{v.name}</span>
                    <span className="text-[10px] font-black uppercase">
                      {v.events.length} upcoming event{v.events.length === 1 ? '' : 's'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {eventsHere.length > 0 && (
            <div>
              <h4 className="font-heading font-black text-xs uppercase border-b border-black pb-1 mb-2">Happening here</h4>
              <ul className="space-y-1.5">
                {eventsHere.map((e) => (
                  <li key={e.id}>
                    <Link href={`/events/${e.id}`} className="block text-xs font-bold underline">
                      {e.title}
                    </Link>
                    <span className="text-[10px] font-bold text-gray-600">
                      {formatDay(e.startsAt)} · {formatTime(e.startsAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {onPick && (
            <button
              type="button"
              disabled={!selected}
              onClick={() => selected && onPick(selected)}
              className="brutal-btn bg-[#00FF66] w-full py-2 text-xs font-black uppercase flex items-center justify-center gap-1.5 mt-auto disabled:opacity-50"
            >
              <FaCheck /> Use this location
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
