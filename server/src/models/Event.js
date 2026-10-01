const mongoose = require('mongoose');
const { CATEGORY_VALUES, EVENT_VISIBILITY, EVENT_STATUS } = require('../constants');

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 160 },
    address: { type: String, trim: true, maxlength: 300 },
    // Optional coordinates for map pins and directions.
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
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
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Registration (public events only). `capacity: null` means unlimited.
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

eventSchema.methods.isOwnedBy = function isOwnedBy(userId) {
  const ownerId = this.owner?._id ?? this.owner;
  return String(ownerId) === String(userId);
};

eventSchema.methods.isOpenForRegistration = function isOpenForRegistration() {
  return (
    this.visibility === EVENT_VISIBILITY.PUBLIC &&
    this.status === EVENT_STATUS.PUBLISHED &&
    this.endsAt > new Date()
  );
};

module.exports = mongoose.model('Event', eventSchema);
