const mongoose = require('mongoose');
const { ORGANIZER_APPLICATION_STATUS } = require('../constants');

/** A member's application to become an event organiser, reviewed by an admin. */
const organizerApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organization: { type: String, required: true, trim: true, maxlength: 120 },
    reason: { type: String, trim: true, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: Object.values(ORGANIZER_APPLICATION_STATUS),
      default: ORGANIZER_APPLICATION_STATUS.PENDING,
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
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

module.exports = mongoose.model('OrganizerApplication', organizerApplicationSchema);
