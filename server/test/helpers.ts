// Must come first: sets the environment before any app module reads it.
import './setup-env';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import supertest from 'supertest';
import { connectDatabase } from '../src/config/db';
import { createApp } from '../src/app';
import { User, type IUser } from '../src/models';
import { signAccessToken } from '../src/lib/tokens';
import type { Role } from '../src/constants';

let mongo: MongoMemoryServer | undefined;

export async function startDatabase() {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  await mongoose.connection.syncIndexes();
}

export async function stopDatabase() {
  await mongoose.disconnect();
  await mongo?.stop();
}

export async function resetDatabase() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database is not connected');
  const collections = await db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

export const app = createApp();
export const api = () => supertest(app);

let counter = 0;

type UserOverrides = Partial<Omit<IUser, 'role'>> & { role?: Role; password?: string };

/** Creates a verified, active user directly in the database and returns it with a token. */
export async function createUser({ role = 'member', name, email, password = 'password123', ...rest }: UserOverrides = {}) {
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

export const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

export function eventInput(overrides: Record<string, unknown> = {}) {
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

export const databaseUri = () => {
  if (!mongo) throw new Error('Database has not been started');
  return mongo.getUri();
};
