const { Notification, User } = require('../../models');
const env = require('../../config/env');
const { notFound } = require('../../lib/errors');
const { emitToUser } = require('../../lib/realtime');
const { sendMail } = require('../../lib/mailer');
const emails = require('../../lib/emailTemplates');
const { paginationMeta } = require('../../lib/schemas');

/**
 * Creates an in-app notification for each user, pushes it over the socket,
 * and (when `email` is set) emails users who opted in to email updates.
 */
async function notify(userIds, { type, title, body = '', eventId = null }, { email = false } = {}) {
  const recipients = [...new Set(userIds.map(String))];
  if (!recipients.length) return;

  const docs = await Notification.insertMany(
    recipients.map((user) => ({ user, type, title, body, event: eventId }))
  );
  for (const doc of docs) emitToUser(doc.user, 'notification:new', doc.toJSON());

  if (!email) return;
  const users = await User.find({ _id: { $in: recipients }, 'preferences.emailNotifications': true }).select('name email');
  const url = eventId ? `${env.clientUrl}/events/${eventId}` : env.clientUrl;
  await Promise.all(
    users.map((u) => sendMail({ to: u.email, ...emails.notification({ name: u.name, title, body, url }) }))
  );
}

async function list(user, { unreadOnly, page, limit }) {
  const filter = { user: user.id, ...(unreadOnly ? { readAt: null } : {}) };
  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: user.id, readAt: null }),
  ]);
  return { items, meta: { ...paginationMeta({ page, limit }, total), unread } };
}

async function markRead(user, id) {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: user.id },
    { $set: { readAt: new Date() } },
    { new: true }
  );
  if (!notification) throw notFound('Notification not found');
  return notification;
}

async function markAllRead(user) {
  const { modifiedCount } = await Notification.updateMany({ user: user.id, readAt: null }, { $set: { readAt: new Date() } });
  return { updated: modifiedCount };
}

module.exports = { notify, list, markRead, markAllRead };
