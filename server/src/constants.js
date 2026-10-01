const ROLES = Object.freeze({
  MEMBER: 'member',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
});

const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
});

const EVENT_CATEGORIES = Object.freeze([
  { value: 'tech', label: 'Tech & Code' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'conference', label: 'Conference' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
]);
const CATEGORY_VALUES = EVENT_CATEGORIES.map((c) => c.value);

const EVENT_VISIBILITY = Object.freeze({
  PUBLIC: 'public', // listed in discovery, open for registration
  PRIVATE: 'private', // personal calendar entry, visible to the owner only
});

const EVENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
});

const REGISTRATION_STATUS = Object.freeze({
  GOING: 'going',
  WAITLISTED: 'waitlisted',
});

const NOTE_TAGS = Object.freeze(['plan', 'speaker', 'logistics', 'ideas', 'personal']);

const ORGANIZER_APPLICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const NOTIFICATION_TYPES = Object.freeze({
  EVENT_UPDATED: 'event_updated',
  EVENT_CANCELLED: 'event_cancelled',
  EVENT_REMINDER: 'event_reminder',
  WAITLIST_PROMOTED: 'waitlist_promoted',
  ANNOUNCEMENT: 'announcement',
  ORGANIZER_APPROVED: 'organizer_approved',
  ORGANIZER_REJECTED: 'organizer_rejected',
});

module.exports = {
  ROLES,
  USER_STATUS,
  EVENT_CATEGORIES,
  CATEGORY_VALUES,
  EVENT_VISIBILITY,
  EVENT_STATUS,
  REGISTRATION_STATUS,
  NOTE_TAGS,
  ORGANIZER_APPLICATION_STATUS,
  NOTIFICATION_TYPES,
};
