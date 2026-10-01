const { User } = require('../../models');
const { badRequest } = require('../../lib/errors');
const { createSession } = require('../auth/auth.service');

async function updateProfile(user, changes) {
  const { preferences, ...rest } = changes;
  user.set(rest);
  if (preferences) {
    for (const [key, value] of Object.entries(preferences)) user.set(`preferences.${key}`, value);
  }
  await user.save();
  return user;
}

/** Changing the password signs out every other session; a fresh token is returned. */
async function changePassword(user, { currentPassword, newPassword }) {
  const account = await User.findById(user.id).select('+passwordHash');
  if (!(await account.checkPassword(currentPassword))) {
    throw badRequest('Your current password is incorrect', 'INVALID_PASSWORD');
  }
  await account.setPassword(newPassword);
  account.passwordChangedAt = new Date();
  await account.save();
  return createSession(account);
}

module.exports = { updateProfile, changePassword };
