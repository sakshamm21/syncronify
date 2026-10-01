import type { UserDocument } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      /** Set by the `authenticate` / `optionalAuth` middleware. */
      user?: UserDocument;
    }
  }
}

export {};
