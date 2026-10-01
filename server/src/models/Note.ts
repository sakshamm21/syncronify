import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { NOTE_TAGS, type NoteTag } from '../constants';

export interface INote {
  owner: Types.ObjectId;
  title: string;
  content: string;
  tag: NoteTag;
  pinned: boolean;
  // Optional link so notes can be shown alongside the event they are about.
  event: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteDocument = HydratedDocument<INote>;

const noteSchema = new Schema<INote>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    content: { type: String, trim: true, maxlength: 20000, default: '' },
    tag: { type: String, enum: NOTE_TAGS, default: 'plan' },
    pinned: { type: Boolean, default: false },
    event: { type: Schema.Types.ObjectId, ref: 'Event', default: null },
  },
  { timestamps: true }
);

noteSchema.index({ owner: 1, pinned: -1, updatedAt: -1 });

export const Note = model<INote>('Note', noteSchema);
