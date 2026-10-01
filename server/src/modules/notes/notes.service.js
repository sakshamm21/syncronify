const { Note } = require('../../models');
const { notFound } = require('../../lib/errors');
const { escapeRegex, paginationMeta } = require('../../lib/schemas');
const { findViewableEvent } = require('../events/events.policy');

const EVENT_FIELDS = 'title startsAt';

async function list(user, { q, tag, event, pinned, page, limit }) {
  const filter = { owner: user._id };
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

async function findOwnNote(user, id) {
  const note = await Note.findOne({ _id: id, owner: user._id });
  if (!note) throw notFound('Note not found');
  return note;
}

/** A note can only be linked to an event its owner is allowed to see. */
async function assertLinkableEvent(user, eventId) {
  if (eventId) await findViewableEvent(user, eventId);
}

async function create(user, input) {
  await assertLinkableEvent(user, input.event);
  const note = await Note.create({ ...input, owner: user._id });
  return note.populate('event', EVENT_FIELDS);
}

async function update(user, id, changes) {
  const note = await findOwnNote(user, id);
  if (changes.event !== undefined) await assertLinkableEvent(user, changes.event);
  note.set(changes);
  await note.save();
  return note.populate('event', EVENT_FIELDS);
}

async function remove(user, id) {
  const note = await findOwnNote(user, id);
  await note.deleteOne();
}

module.exports = { list, create, update, remove };
