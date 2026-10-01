import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { ORGANIZER_APPLICATION_STATUS, type OrganizerApplicationStatus } from '../constants';

export interface IOrganizerApplication {
  user: Types.ObjectId;
  organization: string;
  reason: string;
  status: OrganizerApplicationStatus;
  reviewedBy: Types.ObjectId | null;
  reviewedAt: Date | null;
  reviewNote: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizerApplicationDocument = HydratedDocument<IOrganizerApplication>;

/** A member's application to become an event organiser, reviewed by an admin. */
const organizerApplicationSchema = new Schema<IOrganizerApplication>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organization: { type: String, required: true, trim: true, maxlength: 120 },
    reason: { type: String, trim: true, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: Object.values(ORGANIZER_APPLICATION_STATUS),
      default: ORGANIZER_APPLICATION_STATUS.PENDING,
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

// At most one open application per user.
organizerApplicationSchema.index(
  { user: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: ORGANIZER_APPLICATION_STATUS.PENDING }, name: 'one_pending_per_user' }
);

export const OrganizerApplication = model<IOrganizerApplication>('OrganizerApplication', organizerApplicationSchema);
