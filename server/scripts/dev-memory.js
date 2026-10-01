/**
 * Runs the API against a local MongoDB that needs no installation.
 * Data is kept in server/.data between runs and seeded on first start.
 *
 *   npm run dev:memory
 */
const fs = require('node:fs');
const path = require('node:path');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  const dbPath = path.resolve(__dirname, '../.data/mongo');
  fs.mkdirSync(dbPath, { recursive: true });

  const mongo = await MongoMemoryServer.create({
    instance: { dbPath, storageEngine: 'wiredTiger', port: 27018 },
  });
  // Must be set before anything reads the environment.
  process.env.DB_URI = mongo.getUri('syncronify');

  const mongoose = require('mongoose');
  const { connectDatabase, disconnectDatabase } = require('../src/config/db');
  const { User } = require('../src/models');
  const { seed, DEMO_PASSWORD } = require('./seed');

  await connectDatabase(process.env.DB_URI);
  await mongoose.connection.syncIndexes();
  if (!(await User.exists({}))) {
    await seed();
    console.log(`Seeded demo data. Sign in as member@, organizer@ or admin@syncronify.dev with "${DEMO_PASSWORD}".`);
  }
  await disconnectDatabase();

  process.on('exit', () => mongo.stop());
  require('../src/server').start();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
