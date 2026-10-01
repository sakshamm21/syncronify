/**
 * Fills the database with realistic demo data (accounts for every role,
 * events, registrations, chat, notes). Goes through the real services so
 * counters, waitlists and notifications are consistent.
 *
 *   npm run seed            # only if the database is empty
 *   npm run seed -- --reset # wipe everything first
 */
const { parseArgs } = require('node:util');
const mongoose = require('mongoose');
const env = require('../src/config/env');
const { connectDatabase, disconnectDatabase } = require('../src/config/db');
const models = require('../src/models');
const events = require('../src/modules/events/events.service');
const registrations = require('../src/modules/events/registrations.service');
const chat = require('../src/modules/chat/chat.service');

const DEMO_PASSWORD = 'syncronify123';

const at = (daysFromNow, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const img = (id) => `https://images.unsplash.com/${id}?w=1200&auto=format&fit=crop&q=80`;

async function createUser(fields) {
  const user = new models.User({ emailVerified: true, ...fields });
  await user.setPassword(DEMO_PASSWORD);
  return user.save();
}

async function seed() {
  const admin = await createUser({ name: 'Riya Kapoor', email: 'admin@syncronify.dev', role: 'admin' });
  const tech = await createUser({
    name: 'Arjun Mehta',
    email: 'organizer@syncronify.dev',
    role: 'organizer',
    organization: 'Tech & Computing Society',
    bio: 'We run hackathons, talks and build nights.',
  });
  const cultural = await createUser({
    name: 'Meera Iyer',
    email: 'cultural@syncronify.dev',
    role: 'organizer',
    organization: 'Cultural Affairs Council',
  });
  const member = await createUser({
    name: 'Kabir Singh',
    email: 'member@syncronify.dev',
    interests: ['tech', 'workshop'],
    bio: 'Second-year CSE. Always up for a hackathon.',
  });
  const asha = await createUser({ name: 'Asha Rao', email: 'asha@syncronify.dev', interests: ['cultural', 'social'] });
  const rahul = await createUser({ name: 'Rahul Verma', email: 'rahul@syncronify.dev', interests: ['sports'] });

  const create = (owner, input) => events.create(owner, { visibility: 'public', ...input });

  const summit = await create(tech, {
    title: 'Tech Summit 2026',
    description: 'Keynotes on agentic AI, distributed systems and the future of the web, followed by live demos from student teams.',
    category: 'conference',
    tags: ['ai', 'talks'],
    coverImageUrl: img('photo-1540575467063-178a50c2df87'),
    startsAt: at(3, 10),
    endsAt: at(3, 16),
    venue: { name: 'Main Auditorium', address: 'Academic Area, IIT Kanpur', latitude: 26.5123, longitude: 80.2329 },
    capacity: 300,
  });
  const hackathon = await create(tech, {
    title: '24h Design & Build Hackathon',
    description: 'Form a team, build something delightful in 24 hours. Mentors, food and prizes for the top three teams.',
    category: 'tech',
    tags: ['hackathon', 'design'],
    coverImageUrl: img('photo-1515187029135-18ee286d815b'),
    startsAt: at(7, 9),
    endsAt: at(8, 9),
    venue: { name: 'Innovation Lab', latitude: 26.5149, longitude: 80.2335 },
    capacity: 3,
  });
  const workshop = await create(tech, {
    title: 'Intro to Rust Workshop',
    description: 'Hands-on session covering ownership, borrowing and building a small CLI. Bring a laptop.',
    category: 'workshop',
    tags: ['rust', 'beginner'],
    startsAt: at(1, 17),
    endsAt: at(1, 19),
    venue: { name: 'CC Lab 2' },
    capacity: 40,
  });
  const fest = await create(cultural, {
    title: 'Annual Cultural Fest: Live Band Night',
    description: 'An evening of music, art installations and food pop-ups under the stars.',
    category: 'cultural',
    tags: ['music', 'festival'],
    coverImageUrl: img('photo-1492684223066-81342ee5ff30'),
    startsAt: at(10, 18),
    endsAt: at(10, 23),
    venue: { name: 'Open Air Theatre', latitude: 26.5091, longitude: 80.2297 },
  });
  await create(cultural, {
    title: 'Inter-Hall Football Finals',
    description: 'Cheer for your hall in the season finale.',
    category: 'sports',
    coverImageUrl: img('photo-1431324155629-1a6deb1dec8d'),
    startsAt: at(5, 16),
    endsAt: at(5, 18),
    venue: { name: 'Sports Complex Ground' },
  });
  await create(cultural, {
    title: 'Open Mic & Poetry Evening',
    description: 'Share a poem, a story or a song. Sign-ups at the door.',
    category: 'social',
    startsAt: at(14, 19),
    endsAt: at(14, 21),
    venue: { name: 'Student Activity Centre' },
    capacity: 60,
  });
  await create(tech, {
    title: 'Startup Pitch Night (draft)',
    description: 'Still confirming the judging panel.',
    category: 'meetup',
    status: 'draft',
    startsAt: at(21, 18),
    endsAt: at(21, 21),
  });
  const pastMeetup = await create(tech, {
    title: 'Open Source Contributors Meetup',
    description: 'Monthly meetup for open source contributors on campus.',
    category: 'meetup',
    startsAt: at(-6, 18),
    endsAt: at(-6, 20),
    venue: { name: 'Library Seminar Hall' },
  });

  // Registrations: the hackathon fills up so there is a waitlist to demo.
  for (const user of [member, asha, rahul]) await registrations.register(user, summit.id);
  for (const user of [member, asha, rahul, admin]) await registrations.register(user, hackathon.id);
  await registrations.register(member, workshop.id);
  await registrations.register(asha, fest.id);
  await registrations.register(member, fest.id);

  // A past event with check-ins, so the organiser's attendance rate is populated.
  await models.Registration.insertMany([
    { event: pastMeetup.id, user: member._id, status: 'going', checkedInAt: at(-6, 18, 5) },
    { event: pastMeetup.id, user: rahul._id, status: 'going' },
  ]);
  await models.Event.updateOne({ _id: pastMeetup.id }, { attendeeCount: 2 });

  await chat.postMessage(member, summit.id, { text: 'Is there parking near the auditorium?', announcement: false });
  await chat.postMessage(tech, summit.id, { text: 'Yes, Lot B opposite the Innovation Lab is open all day.', announcement: false });
  await chat.postMessage(tech, summit.id, { text: 'Doors open at 9:30. Bring your student ID for entry.', announcement: true });

  await events.create(member, {
    title: 'Study group: Operating Systems',
    description: 'Revise scheduling and memory management.',
    category: 'other',
    startsAt: at(2, 20),
    endsAt: at(2, 22),
    venue: { name: 'Hall 5 reading room' },
  });

  await models.Note.insertMany([
    { owner: member._id, title: 'Hackathon team ideas', content: 'Campus lost & found app\nShared ride planner', tag: 'ideas', pinned: true, event: hackathon.id },
    { owner: member._id, title: 'Summit talks to catch', content: 'Agentic AI keynote at 11:00', tag: 'plan', event: summit.id },
    { owner: tech._id, title: 'Summit logistics checklist', content: 'Projector test\nPrint QR codes\nConfirm catering for 300', tag: 'logistics', pinned: true, event: summit.id },
  ]);

  await models.OrganizerApplication.create({
    user: asha._id,
    organization: 'Photography Club',
    reason: 'We host monthly photo walks and want to open them to everyone.',
  });

  return { admin, tech, cultural, member, asha, rahul };
}

async function main() {
  const { values } = parseArgs({ options: { reset: { type: 'boolean', default: false } } });
  if (env.isProduction) {
    console.error('Refusing to seed demo data in production.');
    process.exit(1);
  }

  await connectDatabase(env.dbUri);
  await mongoose.connection.syncIndexes();

  if (values.reset) {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
  } else if (await models.User.exists({})) {
    console.log('Database already has data; skipping seed. Use `npm run seed -- --reset` to start over.');
    await disconnectDatabase();
    return;
  }

  await seed();
  console.log(`
Demo data ready. Every account uses the password "${DEMO_PASSWORD}":
  admin@syncronify.dev      platform admin
  organizer@syncronify.dev  organiser (Tech & Computing Society)
  cultural@syncronify.dev   organiser (Cultural Affairs Council)
  member@syncronify.dev     member
  asha@syncronify.dev       member (pending organiser application)
  rahul@syncronify.dev      member
`);
  await disconnectDatabase();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seed, DEMO_PASSWORD };
