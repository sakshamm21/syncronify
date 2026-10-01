const { User, Event, Registration, OrganizerApplication } = require('../../models');
const { badRequest, notFound, conflict } = require('../../lib/errors');
const { escapeRegex, paginationMeta } = require('../../lib/schemas');
const notifications = require('../notifications/notifications.service');
const {
  ROLES,
  USER_STATUS,
  EVENT_VISIBILITY,
  EVENT_STATUS,
  ORGANIZER_APPLICATION_STATUS,
  NOTIFICATION_TYPES,
} = require('../../constants');

async function stats() {
  const now = new Date();
  const publicEvents = { visibility: EVENT_VISIBILITY.PUBLIC };
  const [usersByRole, suspended, upcomingEvents, totalEvents, registrations, pendingApplications] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.countDocuments({ status: USER_STATUS.SUSPENDED }),
    Event.countDocuments({ ...publicEvents, status: EVENT_STATUS.PUBLISHED, endsAt: { $gte: now } }),
    Event.countDocuments(publicEvents),
    Registration.countDocuments(),
    OrganizerApplication.countDocuments({ status: ORGANIZER_APPLICATION_STATUS.PENDING }),
  ]);

  const roles = Object.fromEntries(Object.values(ROLES).map((r) => [r, 0]));
  for (const { _id, count } of usersByRole) roles[_id] = count;

  return {
    users: { total: Object.values(roles).reduce((a, b) => a + b, 0), byRole: roles, suspended },
    events: { total: totalEvents, upcoming: upcomingEvents },
    registrations,
    pendingApplications,
  };
}

async function listUsers({ q, role, status, page, limit }) {
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }, { organization: pattern }];
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  return { items, meta: paginationMeta({ page, limit }, total) };
}

async function updateUser(admin, userId, { role, status }) {
  // Prevents an admin from accidentally locking themselves (or everyone) out.
  if (String(admin._id) === String(userId)) throw badRequest('You cannot change your own role or status');

  const user = await User.findById(userId);
  if (!user) throw notFound('User not found');
  if (role) user.role = role;
  if (status) user.status = status;
  await user.save();
  return user;
}

async function listApplications({ status, page, limit }) {
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    OrganizerApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email avatarUrl role')
      .populate('reviewedBy', 'name'),
    OrganizerApplication.countDocuments(filter),
  ]);
  return { items, meta: paginationMeta({ page, limit }, total) };
}

async function reviewApplication(admin, id, { approve, note }) {
  const application = await OrganizerApplication.findById(id);
  if (!application) throw notFound('Application not found');
  if (application.status !== ORGANIZER_APPLICATION_STATUS.PENDING) throw conflict('This application has already been reviewed');

  application.status = approve ? ORGANIZER_APPLICATION_STATUS.APPROVED : ORGANIZER_APPLICATION_STATUS.REJECTED;
  application.reviewedBy = admin._id;
  application.reviewedAt = new Date();
  application.reviewNote = note;
  await application.save();

  if (approve) {
    await User.updateOne(
      { _id: application.user, role: ROLES.MEMBER },
      { $set: { role: ROLES.ORGANIZER, organization: application.organization } }
    );
  }

  await notifications.notify(
    [application.user],
    approve
      ? {
          type: NOTIFICATION_TYPES.ORGANIZER_APPROVED,
          title: 'You are now an organiser',
          body: `Your application for ${application.organization} was approved. You can now publish public events.`,
        }
      : {
          type: NOTIFICATION_TYPES.ORGANIZER_REJECTED,
          title: 'Organiser application update',
          body: note || 'Your application was not approved this time.',
        },
    { email: true }
  );

  await application.populate([{ path: 'user', select: 'name email avatarUrl role' }, { path: 'reviewedBy', select: 'name' }]);
  return application;
}

module.exports = { stats, listUsers, updateUser, listApplications, reviewApplication };
