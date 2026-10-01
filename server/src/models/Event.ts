import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';
import {
  CATEGORY_VALUES,
  EVENT_VISIBILITY,
  EVENT_STATUS,
  type Category,
  type EventStatus,
  type EventVisibility,
} from '../constants';

export interface Venue {
  name?: string;
  address?: string;
  // Optional coordinates for map pins and directions.
  latitude?: number;
  longitude?: number;
}

export interface IEvent {
  title: string;
  description: string;
  category: Category;
  tags: string[];
  coverImageUrl: string;
  startsAt: Date;
  endsAt: Date;
  venue: Venue;
  onlineUrl: string;
  visibility: EventVisibility;
  status: EventStatus;
  owner: Types.ObjectId;
  // Registration (public events only). `capacity: null` means unlimited.
  capacity: number | null;
  attendeeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EventMethods {
  isOwnedBy(userId: unknown): boolean;
  isOpenForRegistration(): boolean;
}

interface EventVirtuals {
  spotsLeft: number | null;
  isPast: boolean;
}

type EventModel = Model<IEvent, {}, EventMethods, EventVirtuals>;
export type EventDocument = HydratedDocument<IEvent, EventMethods & EventVirtuals>;

const venueSchema = new Schema<Venue>(
  {
    name: { type: String, trim: true, maxlength: 160 },
    address: { type: String, trim: true, maxlength: 300 },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
  },
  { _id: false }
);

const eventSchema = new Schema<IEvent, EventModel, EventMethods, {}, EventVirtuals>(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    category: { type: String, enum: CATEGORY_VALUES, default: 'other' },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
    coverImageUrl: { type: String, trim: true, default: '' },

    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    venue: { type: venueSchema, default: () => ({}) },
    onlineUrl: { type: String, trim: true, default: '' },

    visibility: { type: String, enum: Object.values(EVENT_VISIBILITY), required: true },
    status: { type: String, enum: Object.values(EVENT_STATUS), default: EVENT_STATUS.PUBLISHED },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    capacity: { type: Number, min: 1, default: null },
    attendeeCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

eventSchema.index({ visibility: 1, status: 1, startsAt: 1 });

eventSchema.virtual('spotsLeft').get(function spotsLeft() {
  if (this.capacity == null) return null;
  return Math.max(this.capacity - this.attendeeCount, 0);
});

eventSchema.virtual('isPast').get(function isPast() {
  return this.endsAt < new Date();
});

eventSchema.method('isOwnedBy', function isOwnedBy(userId: unknown) {
  // `owner` is an ObjectId, or a user document once populated.
  const owner = this.owner as Types.ObjectId | { _id: Types.ObjectId };
  const ownerId = '_id' in owner ? owner._id : owner;
  return String(ownerId) === String(userId);
});

eventSchema.method('isOpenForRegistration', function isOpenForRegistration() {
  return (
    this.visibility === EVENT_VISIBILITY.PUBLIC &&
    this.status === EVENT_STATUS.PUBLISHED &&
    this.endsAt > new Date()
  );
});

export const Event = model<IEvent, EventModel>('Event', eventSchema);
