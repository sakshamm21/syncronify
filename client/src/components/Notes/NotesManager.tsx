'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaStickyNote, FaPlus, FaTrash, FaEdit, FaSearch, FaCheck, FaBookmark, FaCalendarAlt } from 'react-icons/fa';
import { errorMessage, meApi, notesApi, type Note, type NoteTag, type SyncEvent } from '@/lib/api';
import { NOTE_TAGS, NOTE_TAG_LABELS, formatDay } from '@/lib/format';

interface Draft {
  id?: string;
  title: string;
  content: string;
  tag: NoteTag;
  event: string | null;
}

const EMPTY_DRAFT: Draft = { title: '', content: '', tag: 'plan', event: null };
const HALF_YEAR_MS = 180 * 24 * 60 * 60 * 1000;

export default function NotesManager() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<NoteTag | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [linkableEvents, setLinkableEvents] = useState<SyncEvent[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      notesApi
        .list({ q: search.trim() || undefined, tag: tag ?? undefined, limit: 50 })
        .then(({ items }) => setNotes(items))
        .catch((err) => toast.error(errorMessage(err)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, tag]);

  const isEditing = draft !== null;

  // Upcoming events the user can attach notes to, loaded when the editor opens.
  useEffect(() => {
    if (!isEditing) return;
    const now = Date.now();
    meApi
      .calendar({ from: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(), to: new Date(now + HALF_YEAR_MS).toISOString() })
      .then(setLinkableEvents)
      .catch(() => setLinkableEvents([]));
  }, [isEditing]);

  const sortNotes = (list: Note[]) =>
    [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!draft?.title.trim()) return;
    setSaving(true);
    try {
      const body = { title: draft.title, content: draft.content, tag: draft.tag, event: draft.event };
      const saved = draft.id ? await notesApi.update(draft.id, body) : await notesApi.create(body);
      setNotes((prev) => sortNotes([saved, ...prev.filter((n) => n.id !== saved.id)]));
      setDraft(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function togglePin(note: Note) {
    try {
      const saved = await notesApi.update(note.id, { pinned: !note.pinned });
      setNotes((prev) => sortNotes(prev.map((n) => (n.id === saved.id ? saved : n))));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function remove(note: Note) {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    try {
      await notesApi.remove(note.id);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="brutal-card p-6 bg-white border-4 border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-[#FF007A] text-white border-2 border-black flex items-center justify-center">
              <FaStickyNote />
            </span>
            <h2 className="font-heading font-black text-2xl uppercase tracking-tight">Notes & Plans</h2>
          </div>
          <p className="text-xs font-bold mt-1">Capture ideas, agendas and checklists, and attach them to events.</p>
        </div>
        <button
          onClick={() => setDraft(EMPTY_DRAFT)}
          className="brutal-btn bg-[#FFE600] px-5 py-2.5 text-xs font-black uppercase flex items-center gap-2 self-start md:self-auto"
        >
          <FaPlus /> New Note
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3.5 text-sm" />
          <input
            type="search"
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search notes"
            className="w-full bg-white border-2 border-black pl-10 pr-4 py-2.5 font-bold text-xs outline-none brutal-shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[null, ...NOTE_TAGS].map((t) => (
            <button
              key={t ?? 'all'}
              onClick={() => setTag(t)}
              className={`brutal-btn text-[11px] px-3 py-1.5 uppercase whitespace-nowrap ${tag === t ? 'bg-[#00F0FF]' : 'bg-white hover:bg-[#FFE600]'}`}
            >
              {t ? NOTE_TAG_LABELS[t] : 'All'}
            </button>
          ))}
        </div>
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="brutal-card w-full max-w-lg bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
            <h3 className="font-heading font-black text-xl uppercase mb-4 border-b-2 border-black pb-2">
              {draft.id ? 'Edit Note' : 'New Note'}
            </h3>
            <form onSubmit={saveDraft} className="space-y-4">
              <div>
                <label htmlFor="note-title" className="block text-xs font-black uppercase mb-1">Title</label>
                <input
                  id="note-title"
                  required
                  autoFocus
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-xs outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="note-tag" className="block text-xs font-black uppercase mb-1">Tag</label>
                  <select
                    id="note-tag"
                    value={draft.tag}
                    onChange={(e) => setDraft({ ...draft, tag: e.target.value as NoteTag })}
                    className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-xs outline-none"
                  >
                    {NOTE_TAGS.map((t) => (
                      <option key={t} value={t}>{NOTE_TAG_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="note-event" className="block text-xs font-black uppercase mb-1">Linked event</label>
                  <select
                    id="note-event"
                    value={draft.event ?? ''}
                    onChange={(e) => setDraft({ ...draft, event: e.target.value || null })}
                    className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-xs outline-none"
                  >
                    <option value="">None</option>
                    {linkableEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="note-content" className="block text-xs font-black uppercase mb-1">Content</label>
                <textarea
                  id="note-content"
                  rows={6}
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-medium text-xs outline-none"
                />
              </div>
              <div className="pt-3 border-t-2 border-black flex justify-end gap-3">
                <button type="button" onClick={() => setDraft(null)} className="brutal-btn bg-[#F4F4F0] px-4 py-2 text-xs uppercase">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="brutal-btn bg-[#00FF66] px-5 py-2 text-xs uppercase flex items-center gap-1 disabled:opacity-60">
                  <FaCheck /> {saving ? 'Saving…' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-xs font-bold">Loading notes…</p>
        ) : notes.length === 0 ? (
          <div className="col-span-full brutal-card p-10 bg-white border-2 border-black text-center">
            <p className="font-heading font-bold text-lg">{search || tag ? 'No matching notes' : 'No notes yet'}</p>
            <p className="text-xs font-medium mt-1">Use notes for agendas, checklists and ideas for your events.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={`brutal-card brutal-card-hover p-5 flex flex-col justify-between ${note.pinned ? 'bg-[#FFE600]/20' : 'bg-white'}`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="brutal-badge bg-[#00F0FF] text-black">{NOTE_TAG_LABELS[note.tag]}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePin(note)}
                      aria-label={note.pinned ? 'Unpin' : 'Pin'}
                      className={`p-1.5 border border-black text-xs ${note.pinned ? 'bg-[#FF007A] text-white' : 'bg-white'}`}
                    >
                      <FaBookmark />
                    </button>
                    <button
                      onClick={() => setDraft({ id: note.id, title: note.title, content: note.content, tag: note.tag, event: note.event?.id ?? null })}
                      aria-label="Edit"
                      className="p-1.5 border border-black bg-white text-xs hover:bg-[#FFE600]"
                    >
                      <FaEdit />
                    </button>
                    <button onClick={() => remove(note)} aria-label="Delete" className="p-1.5 border border-black bg-[#FF007A] text-white text-xs hover:bg-black">
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <h3 className="font-heading font-extrabold text-lg mb-2 leading-snug">{note.title}</h3>
                <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap line-clamp-6">{note.content}</p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between gap-2 text-[10px] font-bold uppercase">
                {note.event ? (
                  <Link href={`/events/${note.event.id}`} className="flex items-center gap-1 underline truncate">
                    <FaCalendarAlt /> {note.event.title}
                  </Link>
                ) : (
                  <span>Updated {formatDay(note.updatedAt)}</span>
                )}
                {note.pinned && <span className="bg-black text-white px-1.5 py-0.5 shrink-0">PINNED</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
