const mongoose = require('mongoose');

/** A chat message in an event's discussion channel. */
const messageSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    // Announcements are organiser broadcasts; attendees are also notified.
    isAnnouncement: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
