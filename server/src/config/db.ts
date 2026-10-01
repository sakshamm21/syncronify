import mongoose from 'mongoose';
import logger from '../lib/logger';

mongoose.set('strictQuery', true);

// Every model serialises with `id` instead of `_id` and without `__v`.
mongoose.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret._id;
    return ret;
  },
});

let connecting: Promise<typeof mongoose.connection> | null = null;

/**
 * Connects once and reuses the connection. Serverless functions call this on
 * every request; warm instances get the existing connection for free.
 */
export function connectDatabase(uri: string | undefined): Promise<typeof mongoose.connection> {
  const { readyState } = mongoose.connection; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
  if (readyState === 1) return Promise.resolve(mongoose.connection);
  // A cached promise is only valid while that attempt is still in flight.
  if (readyState !== 2) connecting = null;
  if (!connecting) {
    if (!uri) return Promise.reject(new Error('DB_URI is not configured'));
    connecting = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10_000, maxPoolSize: 10 })
      .then(() => {
        logger.info({ host: mongoose.connection.host, db: mongoose.connection.name }, 'Connected to MongoDB');
        return mongoose.connection;
      })
      .catch((err: unknown) => {
        connecting = null; // allow a retry on the next request
        throw err;
      });
  }
  return connecting;
}

export async function disconnectDatabase(): Promise<void> {
  connecting = null;
  await mongoose.disconnect();
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
