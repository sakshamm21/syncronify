const { Message, Registration } = require('../../models');
const { forbidden } = require('../../lib/errors');
const { emitToEvent } = require('../../lib/realtime');
const notifications = require('../notifications/notifications.service');
const { findViewableEvent, canChat, canManage } = require('../events/events.policy');
const { NOTIFICATION_TYPES } = require('../../constants');

const SENDER_FIELDS = 'name avatarUrl role';

async function findChatEvent(user, eventId) {
  const event = await findViewableEvent(user, eventId);
  const registration = await Registration.findOne({ event: event._id, user: user.id }).select('status');
  if (!canChat(user, event, registration?.status)) {
    throw forbidden('Register for this event to join its discussion', 'CHAT_FORBIDDEN');
  }
  return event;
}

/**
 * Messages for display, oldest-first.
 * - `before`: the newest `limit` messages older than the cursor (scrolling back).
 * - `after`: messages newer than the cursor (polling for new ones).
 */
async function listMessages(user, eventId, { before, after, limit }) {
  const event = await findChatEvent(user, eventId);

  if (after) {
    const newer = await Message.find({ event: event._id, createdAt: { $gt: after } })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('sender', SENDER_FIELDS);
    return { items: newer, hasMore: false };
  }

  const messages = await Message.find({ event: event._id, ...(before ? { createdAt: { $lt: before } } : {}) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', SENDER_FIELDS);
  return { items: messages.reverse(), hasMore: messages.length === limit };
}

async function postMessage(user, eventId, { text, announcement }) {
  const event = await findChatEvent(user, eventId);
  if (announcement && !canManage(user, event)) throw forbidden('Only the organiser can post announcements');

  const message = await Message.create({ event: event._id, sender: user._id, text, isAnnouncement: announcement });
  await message.populate('sender', SENDER_FIELDS);
  const json = message.toJSON();
  emitToEvent(event._id, 'message:new', json);

  if (announcement) {
    const attendees = await Registration.find({ event: event._id, user: { $ne: user._id } }).distinct('user');
    await notifications.notify(
      attendees,
      { type: NOTIFICATION_TYPES.ANNOUNCEMENT, title: `${event.title}: announcement`, body: text, eventId: event._id },
      { email: true }
    );
  }
  return json;
}

module.exports = { findChatEvent, listMessages, postMessage };
