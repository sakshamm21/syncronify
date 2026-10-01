'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaMapMarkerAlt, FaCalendarPlus, FaImage, FaCheck, FaTag, FaSave, FaLink } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '@/context/AuthContext';
import { useEventsSync } from '@/context/EventContext';
import { ApiError, errorMessage, eventsApi, type CategoryValue, type EventInput, type SyncEvent } from '@/lib/api';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/format';
import VenueMap, { type PickedLocation } from '../VenueMap/VenueMap';
import { usePlaceSearch } from '../VenueMap/usePlaceSearch';

interface CreateEventProps {
  isCreateActive: boolean;
  handleCreateActive: (active: boolean) => void;
  /** Edit this event instead of creating a new one. */
  event?: SyncEvent | null;
  /** Pre-fills the start date (e.g. a day clicked on the calendar). */
  initialDate?: Date | null;
  onSaved?: (event: SyncEvent) => void;
}

interface FormState {
  title: string;
  description: string;
  category: CategoryValue;
  startsAt: Date;
  endsAt: Date;
  venueName: string;
  venueAddress: string;
  latitude?: number;
  longitude?: number;
  onlineUrl: string;
  tags: string;
  coverImageUrl: string;
  capacity: string;
  isPublic: boolean;
}

function defaultStart(date?: Date | null) {
  const start = date ? new Date(date) : new Date();
  if (!date) start.setDate(start.getDate() + 1);
  start.setHours(date && date.getHours() ? date.getHours() : 18, 0, 0, 0);
  return start;
}

function initialState(event: SyncEvent | null | undefined, canPublish: boolean, date?: Date | null): FormState {
  if (event) {
    return {
      title: event.title,
      description: event.description,
      category: event.category,
      startsAt: new Date(event.startsAt),
      endsAt: new Date(event.endsAt),
      venueName: event.venue?.name ?? '',
      venueAddress: event.venue?.address ?? '',
      latitude: event.venue?.latitude,
      longitude: event.venue?.longitude,
      onlineUrl: event.onlineUrl,
      tags: event.tags.join(', '),
      coverImageUrl: event.coverImageUrl,
      capacity: event.capacity ? String(event.capacity) : '',
      isPublic: event.visibility === 'public',
    };
  }
  const startsAt = defaultStart(date);
  return {
    title: '',
    description: '',
    category: 'tech',
    startsAt,
    endsAt: new Date(startsAt.getTime() + 2 * 60 * 60 * 1000),
    venueName: '',
    venueAddress: '',
    onlineUrl: '',
    tags: '',
    coverImageUrl: '',
    capacity: '',
    isPublic: canPublish,
  };
}

const parseTags = (value: string) =>
  [...new Set(value.split(',').map((t) => t.trim().replace(/^#/, '').toLowerCase()).filter(Boolean))].slice(0, 10);

const inputClass = 'w-full bg-[#F4F4F0] border-2 border-black p-3 font-bold text-sm outline-none focus:bg-white';
const labelClass = 'block text-xs font-black uppercase mb-1 text-black';

export default function CreateEvent({ isCreateActive, handleCreateActive, event, initialDate, onSaved }: CreateEventProps) {
  const { user } = useAuth();
  const { eventsChanged } = useEventsSync();
  const canPublish = user?.role === 'organizer' || user?.role === 'admin';
  const isEdit = Boolean(event);

  const [form, setForm] = useState<FormState>(() => initialState(event, canPublish, initialDate));
  const [venueQuery, setVenueQuery] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const places = usePlaceSearch(venueQuery);

  // Reset whenever the modal is (re)opened.
  useEffect(() => {
    if (isCreateActive) {
      setForm(initialState(event, canPublish, initialDate));
      setErrors({});
      setVenueQuery('');
    }
  }, [isCreateActive, event, canPublish, initialDate]);

  if (!isCreateActive) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  function typeVenue(value: string) {
    // Typing a new name drops any coordinates picked earlier.
    setForm((prev) => ({ ...prev, venueName: value, venueAddress: '', latitude: undefined, longitude: undefined }));
    setVenueQuery(value);
  }

  function applyLocation(location: PickedLocation) {
    setForm((prev) => ({
      ...prev,
      venueName: location.name,
      venueAddress: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
    setVenueQuery('');
    places.clear();
    setMapOpen(false);
  }

  async function save(asDraft: boolean) {
    const body: EventInput = {
      title: form.title,
      description: form.description,
      category: form.category,
      tags: parseTags(form.tags),
      startsAt: form.startsAt.toISOString(),
      endsAt: form.endsAt.toISOString(),
      coverImageUrl: form.coverImageUrl.trim(),
      onlineUrl: form.onlineUrl.trim(),
      venue: {
        name: form.venueName.trim() || undefined,
        address: form.venueAddress || undefined,
        latitude: form.latitude,
        longitude: form.longitude,
      },
    };
    if (form.isPublic) {
      body.capacity = form.capacity ? Number(form.capacity) : null;
      // Editing keeps the current status unless the user explicitly saves a draft or publishes one.
      if (!isEdit || event?.status === 'draft') body.status = asDraft ? 'draft' : 'published';
    }
    if (!isEdit) body.visibility = form.isPublic ? 'public' : 'private';

    setSaving(true);
    setErrors({});
    try {
      const saved = isEdit ? await eventsApi.update(event!.id, body) : await eventsApi.create(body);
      toast.success(isEdit ? 'Event updated' : form.isPublic && !asDraft ? 'Event published' : 'Event saved');
      eventsChanged();
      onSaved?.(saved);
      handleCreateActive(false);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR') {
        const fieldErrors: Record<string, string> = {};
        for (const d of err.details) fieldErrors[d.field.replace(/^body\./, '').split('.')[0]] ??= d.message;
        setErrors(fieldErrors);
      }
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? <p className="text-[11px] font-bold text-[#FF007A] mt-1">{errors[name]}</p> : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" className="brutal-card w-full max-w-2xl bg-white border-4 border-black p-6 shadow-[10px_10px_0px_#000] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-[#FFE600] border-2 border-black flex items-center justify-center text-xl">
              <FaCalendarPlus />
            </span>
            <div>
              <h2 className="font-heading font-black text-2xl uppercase tracking-tight">{isEdit ? 'Edit Event' : 'Create Event'}</h2>
              <p className="text-xs font-bold uppercase">
                {form.isPublic ? 'Public listing, open for RSVPs' : 'Personal: only you can see it'}
              </p>
            </div>
          </div>
          <button onClick={() => handleCreateActive(false)} aria-label="Close" className="brutal-btn bg-[#FF007A] text-white w-9 h-9 flex items-center justify-center">
            <FaTimes />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(false);
          }}
          className="space-y-5"
        >
          {canPublish && !isEdit && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: true, label: 'Public event', hint: 'Listed for everyone to RSVP' },
                { value: false, label: 'Personal', hint: 'Only on your calendar' },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => set('isPublic', option.value)}
                  className={`brutal-btn p-3 text-left ${form.isPublic === option.value ? 'bg-[#FFE600]' : 'bg-[#F4F4F0]'}`}
                >
                  <span className="block text-xs font-black uppercase">{option.label}</span>
                  <span className="block text-[11px] font-medium">{option.hint}</span>
                </button>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="event-title" className={labelClass}>
              Title <span className="text-[#FF007A]">*</span>
            </label>
            <input
              id="event-title"
              required
              placeholder="e.g. Design Hackathon 2026"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className={inputClass}
            />
            <FieldError name="title" />
          </div>

          <div>
            <span className={`${labelClass} flex items-center gap-1`}>
              <FaTag /> Category
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  className={`brutal-btn text-xs px-3 py-1.5 uppercase ${form.category === cat ? 'bg-[#FFE600]' : 'bg-[#F4F4F0] hover:bg-[#00F0FF]'}`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="event-description" className={labelClass}>Description</label>
            <textarea
              id="event-description"
              rows={3}
              placeholder="What will people do, learn or experience?"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFE600]/20 border-2 border-black p-4">
            <div>
              <label className={labelClass}>Starts</label>
              <DatePicker
                selected={form.startsAt}
                onChange={(date: Date | null) => {
                  if (!date) return;
                  const duration = form.endsAt.getTime() - form.startsAt.getTime();
                  setForm((prev) => ({ ...prev, startsAt: date, endsAt: new Date(date.getTime() + Math.max(duration, 60 * 60 * 1000)) }));
                }}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                className="w-full bg-white border-2 border-black p-2 font-bold text-xs"
              />
            </div>
            <div>
              <label className={labelClass}>Ends</label>
              <DatePicker
                selected={form.endsAt}
                onChange={(date: Date | null) => date && set('endsAt', date)}
                minDate={form.startsAt}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                className="w-full bg-white border-2 border-black p-2 font-bold text-xs"
              />
              <FieldError name="endsAt" />
            </div>
          </div>

          <div>
            <label htmlFor="event-venue" className={labelClass}>Venue</label>
            <div className="relative flex flex-col sm:flex-row gap-2">
              <input
                id="event-venue"
                placeholder="Search a place or type a room name…"
                value={form.venueName}
                onChange={(e) => typeVenue(e.target.value)}
                autoComplete="off"
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="brutal-btn bg-[#00F0FF] text-black px-4 py-2 text-xs font-black uppercase flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt /> Pick on map
              </button>
            </div>
            {venueQuery.trim().length >= 3 && (places.results.length > 0 || places.searching) && (
              <ul className="mt-1 bg-white border-2 border-black max-h-44 overflow-y-auto">
                {places.searching && <li className="p-2 text-xs font-bold">Searching…</li>}
                {places.results.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => applyLocation(p)} className="w-full text-left p-2 text-xs border-b border-black hover:bg-[#FFE600]">
                      <span className="font-black">{p.name}</span>
                      <span className="block text-[11px] text-gray-600 truncate">{p.address}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {form.latitude != null && form.longitude != null && (
              <p className="mt-1 text-[11px] font-extrabold text-[#00FF66] bg-black px-2 py-0.5 w-fit flex items-center gap-1">
                <FaCheck /> Pinned on the map{form.venueAddress ? `: ${form.venueAddress.split(',').slice(0, 2).join(',')}` : ''}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="event-online" className={`${labelClass} flex items-center gap-1`}>
              <FaLink /> Online link <span className="normal-case font-bold text-gray-600">(optional, for hybrid or online events)</span>
            </label>
            <input
              id="event-online"
              placeholder="https://meet.google.com/…"
              value={form.onlineUrl}
              onChange={(e) => set('onlineUrl', e.target.value)}
              className={`${inputClass} font-mono text-xs`}
            />
            <FieldError name="onlineUrl" />
          </div>

          <div>
            <label htmlFor="event-tags" className={labelClass}>
              Tags <span className="normal-case font-bold text-gray-600">(comma-separated, helps people find it in search)</span>
            </label>
            <input
              id="event-tags"
              placeholder="ai, beginner-friendly, free food"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              className={inputClass}
            />
            <FieldError name="tags" />
          </div>

          {form.isPublic && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-capacity" className={labelClass}>Capacity</label>
                <input
                  id="event-capacity"
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={form.capacity}
                  onChange={(e) => set('capacity', e.target.value)}
                  className={inputClass}
                />
                <p className="text-[10px] font-bold text-gray-600 mt-1">When it fills up, new RSVPs join a waitlist automatically.</p>
                <FieldError name="capacity" />
              </div>
              <div>
                <label htmlFor="event-cover" className={`${labelClass} flex items-center gap-1`}>
                  <FaImage /> Cover image URL
                </label>
                <input
                  id="event-cover"
                  placeholder="https://…"
                  value={form.coverImageUrl}
                  onChange={(e) => set('coverImageUrl', e.target.value)}
                  className={`${inputClass} font-mono text-xs`}
                />
                <FieldError name="coverImageUrl" />
              </div>
            </div>
          )}

          <div className="pt-4 border-t-4 border-black flex flex-wrap items-center justify-end gap-3">
            <button type="button" onClick={() => handleCreateActive(false)} className="brutal-btn bg-[#F4F4F0] px-5 py-2.5 text-xs font-black uppercase">
              Cancel
            </button>
            {form.isPublic && (!isEdit || event?.status === 'draft') && (
              <button
                type="button"
                disabled={saving}
                onClick={() => save(true)}
                className="brutal-btn bg-white px-5 py-2.5 text-xs font-black uppercase flex items-center gap-2"
              >
                <FaSave /> Save draft
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="brutal-btn bg-[#00FF66] text-black px-6 py-2.5 text-xs font-black uppercase flex items-center gap-2 disabled:opacity-60"
            >
              <FaCalendarPlus />
              {saving
                ? 'Saving…'
                : isEdit && event?.status !== 'draft'
                  ? 'Save changes'
                  : form.isPublic
                    ? 'Publish event'
                    : 'Add to my calendar'}
            </button>
          </div>
        </form>
      </div>

      {mapOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 p-4 md:p-6 flex items-center justify-center">
          <div className="w-full max-w-5xl h-[90vh]">
            <VenueMap onPick={applyLocation} onClose={() => setMapOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
