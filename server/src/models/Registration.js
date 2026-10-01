const mongoose = require('mongoose');
const { REGISTRATION_STATUS } = require('../constants');

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: Object.values(REGISTRATION_STATUS), required: true },
    checkedInAt: { type: Date, default: null },
    reminderSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

registrationSchema.index({ event: 1, user: 1 }, { unique: true });
// Waitlist is served first-come, first-served.
registrationSchema.index({ event: 1, status: 1, createdAt: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
