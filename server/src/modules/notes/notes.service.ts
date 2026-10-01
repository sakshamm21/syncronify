import type { FilterQuery } from 'mongoose';
import { Note, type INote, type UserDocument } from '../../models';
import { notFound } from '../../lib/errors';
import { escapeRegex, paginationMeta, type Page } from '../../lib/schemas';
import { findViewableEvent } from '../events/events.policy';
import type { NoteTag } from '../../constants';

const EVENT_FIELDS = 'title startsAt';

export interface NoteInput {
  title: string;
  content: string;
  tag: NoteTag;
  pinned: boolean;
  event: string | null;
}

export async function list(
  user: UserDocument,
  { q, tag, event, pinned, page, limit }: Page & { q?: string; tag?: NoteTag; event?: string; pinned?: boolean }
) {
  const filter: FilterQuery<INote> = { owner: user._id };
  if (tag) filter.tag = tag;
  if (event) filter.event = event;
  if (pinned !== undefined) filter.pinned = pinned;
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: pattern }, { content: pattern }];
  }

  const [items, total] = await Promise.all([
    Note.find(filter)
      .sort({ pinned: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('event', EVENT_FIELDS),
    Note.countDocuments(filter),
  ]);
  return { items, meta: paginationMeta({ page, limit }, total) };
}

async function findOwnNote(user: UserDocument, id: string) {
  const note = await Note.findOne({ _id: id, owner: user._id });
  if (!note) throw notFound('Note not found');
  return note;
}

/** A note can only be linked to an event its owner is allowed to see. */
async function assertLinkableEvent(user: UserDocument, eventId: string | null | undefined) {
  if (eventId) await findViewableEvent(user, eventId);
}

export async function create(user: UserDocument, input: NoteInput) {
  await assertLinkableEvent(user, input.event);
  const note = await Note.create({ ...input, owner: user._id });
  return note.populate('event', EVENT_FIELDS);
}

export async function update(user: UserDocument, id: string, changes: Partial<NoteInput>) {
  const note = await findOwnNote(user, id);
  if (changes.event !== undefined) await assertLinkableEvent(user, changes.event);
  note.set(changes);
  await note.save();
  return note.populate('event', EVENT_FIELDS);
}

export async function remove(user: UserDocument, id: string): Promise<void> {
  const note = await findOwnNote(user, id);
  await note.deleteOne();
}
