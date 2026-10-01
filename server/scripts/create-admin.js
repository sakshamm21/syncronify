/**
 * Creates the first platform admin, or promotes an existing account.
 * Admins cannot be created through sign-up.
 *
 *   npm run create-admin -- --email you@example.com --name "Your Name" --password "a-strong-password"
 */
const { parseArgs } = require('node:util');
const env = require('../src/config/env');
const { connectDatabase, disconnectDatabase } = require('../src/config/db');
const { User } = require('../src/models');

async function main() {
  const { values } = parseArgs({
    options: { email: { type: 'string' }, name: { type: 'string' }, password: { type: 'string' } },
  });
  const email = values.email?.trim().toLowerCase();
  if (!email) {
    console.error('Usage: npm run create-admin -- --email <email> [--name <name>] [--password <password>]');
    process.exit(1);
  }

  await connectDatabase(env.dbUri);
  let user = await User.findOne({ email });

  if (user) {
    user.role = 'admin';
    user.status = 'active';
    user.emailVerified = true;
    if (values.password) {
      await user.setPassword(values.password);
      user.passwordChangedAt = new Date();
    }
    await user.save();
    console.log(`Promoted ${email} to admin.`);
  } else {
    if (!values.password || values.password.length < 8) {
      console.error('A --password of at least 8 characters is required to create a new account.');
      process.exit(1);
    }
    user = new User({ email, name: values.name || email.split('@')[0], role: 'admin', emailVerified: true });
    await user.setPassword(values.password);
    await user.save();
    console.log(`Created admin account ${email}.`);
  }

  await disconnectDatabase();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
