'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, Pencil, Pin, Plus, Search, StickyNote, Trash2 } from 'lucide-react';
import { errorMessage, meApi, notesApi, type Note, type NoteTag, type SyncEvent } from '@/lib/api';
import { NOTE_TAGS, NOTE_TAG_LABELS, formatRelative } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Dialog } from '@/components/ui/overlay';
import { Badge, EmptyState, PageHeader } from '@/components/ui/surface';
import { FilterChips } from '@/components/ui/tabs';
import { cn } from '@/lib/cn';

interface Draft {
  id?: string;
  title: string;
  content: string;
  tag: NoteTag;
  event: string | null;
}

const EMPTY_DRAFT: Draft = { title: '', content: '', tag: 'plan', event: null };
const DAY_MS = 24 * 60 * 60 * 1000;

const sortNotes = (list: Note[]) =>
  [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));

export default function NotesBoard() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<NoteTag | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [linkableEvents, setLinkableEvents] = useState<SyncEvent[]>([]);
  const isEditing = draft !== null;

  useEffect(() => {
    const timer = setTimeout(() => {
      notesApi
        .list({ q: search.trim() || undefined, tag: tag ?? undefined, limit: 50 })
        .then(({ items }) => setNotes(items))
        .catch((err) => toast.error(errorMessage(err)));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, tag]);

  // Events the user can attach notes to, loaded when the editor opens.
  useEffect(() => {
    if (!isEditing) return;
    const now = Date.now();
    meApi
      .calendar({ from: new Date(now - 7 * DAY_MS).toISOString(), to: new Date(now + 180 * DAY_MS).toISOString() })
      .then(setLinkableEvents)
      .catch(() => setLinkableEvents([]));
  }, [isEditing]);

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!draft?.title.trim()) return;
    setSaving(true);
    try {
      const body = { title: draft.title, content: draft.content, tag: draft.tag, event: draft.event };
      const saved = draft.id ? await notesApi.update(draft.id, body) : await notesApi.create(body);
      setNotes((prev) => sortNotes([saved, ...(prev ?? []).filter((n) => n.id !== saved.id)]));
      setDraft(null);
      toast.success(draft.id ? 'Note updated' : 'Note added');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function togglePin(note: Note) {
    try {
      const saved = await notesApi.update(note.id, { pinned: !note.pinned });
      setNotes((prev) => sortNotes((prev ?? []).map((n) => (n.id === saved.id ? saved : n))));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function remove(note: Note) {
    setNotes((prev) => prev?.filter((n) => n.id !== note.id) ?? prev);
    try {
      await notesApi.remove(note.id);
      toast('Note deleted');
    } catch (err) {
      toast.error(errorMessage(err));
      setNotes((prev) => sortNotes([note, ...(prev ?? [])]));
    }
  }

  return (
    <>
      <PageHeader
        title="Notes"
        description="Agendas, checklists and ideas, optionally linked to an event."
        actions={
          <Button onClick={() => setDraft(EMPTY_DRAFT)}>
            <Plus /> New note
          </Button>
        }
      />

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <input
            type="search"
            placeholder="Search notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search notes"
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm shadow-soft outline-none transition focus:border-primary focus:ring-4 focus:ring-ring/20"
          />
        </div>
        <FilterChips<NoteTag> value={tag} onChange={setTag} options={NOTE_TAGS.map((t) => ({ value: t, label: NOTE_TAG_LABELS[t] }))} />
      </div>

      {notes === null ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-surface-muted" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<StickyNote />}
          title={search || tag ? 'No matching notes' : 'No notes yet'}
          description="Keep agendas, logistics and ideas next to the events they're for."
          action={!search && !tag && <Button onClick={() => setDraft(EMPTY_DRAFT)}><Plus /> Write your first note</Button>}
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {notes.map((note) => (
              <motion.article
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'group flex flex-col rounded-2xl border bg-surface p-5 shadow-soft transition hover:shadow-lifted',
                  note.pinned ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge tone={note.pinned ? 'primary' : 'neutral'}>{NOTE_TAG_LABELS[note.tag]}</Badge>
                  <div className="flex gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <Button variant="ghost" size="icon-sm" onClick={() => togglePin(note)} aria-label={note.pinned ? 'Unpin' : 'Pin'}>
                      <Pin className={cn(note.pinned && 'fill-current text-primary')} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit"
                      onClick={() => setDraft({ id: note.id, title: note.title, content: note.content, tag: note.tag, event: note.event?.id ?? null })}
                    >
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => remove(note)} className="hover:text-danger">
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <h3 className="mt-3 font-semibold leading-snug">{note.title}</h3>
                {note.content && <p className="mt-1.5 line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-muted">{note.content}</p>}
                <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-subtle">
                  {note.event ? (
                    <Link href={`/events/${note.event.id}`} className="flex min-w-0 items-center gap-1.5 font-medium text-primary hover:underline">
                      <CalendarDays className="size-3.5 shrink-0" />
                      <span className="truncate">{note.event.title}</span>
                    </Link>
                  ) : (
                    <span>Edited {formatRelative(note.updatedAt)}</span>
                  )}
                  {note.pinned && <Pin className="size-3.5 fill-current text-primary" />}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Dialog
        open={isEditing}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit note' : 'New note'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
            <Button type="submit" form="note-form" loading={saving}>Save note</Button>
          </>
        }
      >
        {draft && (
          <form id="note-form" onSubmit={saveDraft} className="space-y-4 p-6">
            <Field label="Title" htmlFor="note-title">
              <Input id="note-title" required autoFocus value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tag" htmlFor="note-tag">
                <Select id="note-tag" value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value as NoteTag })}>
                  {NOTE_TAGS.map((t) => (
                    <option key={t} value={t}>{NOTE_TAG_LABELS[t]}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Linked event" htmlFor="note-event">
                <Select id="note-event" value={draft.event ?? ''} onChange={(e) => setDraft({ ...draft, event: e.target.value || null })}>
                  <option value="">None</option>
                  {linkableEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Note" htmlFor="note-content">
              <Textarea id="note-content" rows={8} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
            </Field>
          </form>
        )}
      </Dialog>
    </>
  );
}
