import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface IMessage {
  event: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  // Announcements are organiser broadcasts; attendees are also notified.
  isAnnouncement: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDocument = HydratedDocument<IMessage>;

/** A chat message in an event's discussion channel. */
const messageSchema = new Schema<IMessage>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    isAnnouncement: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ event: 1, createdAt: -1 });

export const Message = model<IMessage>('Message', messageSchema);
