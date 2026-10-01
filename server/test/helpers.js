// Must be set before any app module reads the environment.
process.env.NODE_ENV = 'test';
process.env.SMTP_HOST = '';
process.env.CLIENT_URL ??= 'http://localhost:3000';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const supertest = require('supertest');
const { connectDatabase } = require('../src/config/db');
const { createApp } = require('../src/app');
const { User } = require('../src/models');
const { signAccessToken } = require('../src/lib/tokens');

let mongo;

async function startDatabase() {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  await mongoose.connection.syncIndexes();
}

async function stopDatabase() {
  await mongoose.disconnect();
  await mongo?.stop();
}

async function resetDatabase() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

const app = createApp();
const api = () => supertest(app);

let counter = 0;

/** Creates a verified, active user directly in the database and returns it with a token. */
async function createUser({ role = 'member', name, email, password = 'password123', ...rest } = {}) {
  counter += 1;
  const user = new User({
    name: name ?? `User ${counter}`,
    email: email ?? `user${counter}@example.com`,
    role,
    emailVerified: true,
    ...rest,
  });
  await user.setPassword(password);
  await user.save();
  const token = signAccessToken(user);
  return { user, token, auth: { Authorization: `Bearer ${token}` } };
}

const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

function eventInput(overrides = {}) {
  return {
    title: 'Campus Hackathon',
    description: 'Build something great in 24 hours.',
    category: 'tech',
    startsAt: hoursFromNow(48),
    endsAt: hoursFromNow(50),
    venue: { name: 'Innovation Lab', latitude: 26.51, longitude: 80.23 },
    ...overrides,
  };
}

const databaseUri = () => mongo.getUri();

module.exports = { databaseUri, startDatabase, stopDatabase, resetDatabase, api, app, createUser, eventInput, hoursFromNow };
