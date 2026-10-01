const mongoose = require('mongoose');
const { NOTE_TAGS } = require('../constants');

const noteSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    content: { type: String, trim: true, maxlength: 20000, default: '' },
    tag: { type: String, enum: NOTE_TAGS, default: 'plan' },
    pinned: { type: Boolean, default: false },
    // Optional link so notes can be shown alongside the event they are about.
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  },
  { timestamps: true }
);

noteSchema.index({ owner: 1, pinned: -1, updatedAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
