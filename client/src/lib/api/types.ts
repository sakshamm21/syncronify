// Shapes returned by the Syncronify API. Dates arrive as ISO strings.

export type Role = 'member' | 'organizer' | 'admin';
export type UserStatus = 'active' | 'suspended';

export type CategoryValue =
  | 'tech'
  | 'workshop'
  | 'cultural'
  | 'sports'
  | 'meetup'
  | 'conference'
  | 'social'
  | 'other';

export interface Category {
  value: CategoryValue;
  label: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  bio: string;
  avatarUrl: string;
  organization: string;
  interests: CategoryValue[];
  preferences: { emailNotifications: boolean };
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  avatarUrl: string;
  organization: string;
  role: Role;
}

export interface Session {
  token: string;
  user: User;
}

export type RegistrationStatus = 'going' | 'waitlisted';
export type EventVisibility = 'public' | 'private';
export type EventStatus = 'draft' | 'published' | 'cancelled';

export interface Venue {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

/** A search result from the place lookup (OpenStreetMap). */
export interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

/** A venue in use by upcoming public events. */
export interface VenueSummary {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  events: { id: string; title: string; category: CategoryValue; startsAt: string; endsAt: string }[];
}

export interface EventViewer {
  isOwner: boolean;
  canManage: boolean;
  canChat: boolean;
  registration: RegistrationStatus | null;
}

export interface SyncEvent {
  id: string;
  title: string;
  description: string;
  category: CategoryValue;
  tags: string[];
  coverImageUrl: string;
  startsAt: string;
  endsAt: string;
  venue: Venue;
  onlineUrl: string;
  visibility: EventVisibility;
  status: EventStatus;
  owner: UserSummary;
  capacity: number | null;
  attendeeCount: number;
  spotsLeft: number | null;
  isPast: boolean;
  createdAt: string;
  updatedAt: string;
  viewer: EventViewer;
}

export interface EventInput {
  title: string;
  description?: string;
  category?: CategoryValue;
  tags?: string[];
  coverImageUrl?: string;
  startsAt: string;
  endsAt: string;
  venue?: Venue;
  onlineUrl?: string;
  visibility?: EventVisibility;
  status?: 'draft' | 'published';
  capacity?: number | null;
}

export interface Attendee {
  id: string;
  status: RegistrationStatus;
  registeredAt: string;
  checkedInAt: string | null;
  user: { id: string; name: string; email: string; avatarUrl: string } | null;
}

export interface AttendeeList {
  items: Attendee[];
  counts: { going: number; waitlisted: number; checkedIn: number };
}

export type NoteTag = 'plan' | 'speaker' | 'logistics' | 'ideas' | 'personal';

export interface Note {
  id: string;
  title: string;
  content: string;
  tag: NoteTag;
  pinned: boolean;
  event: { id: string; title: string; startsAt: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  event: string;
  text: string;
  isAnnouncement: boolean;
  sender: { id: string; name: string; avatarUrl: string; role: Role };
  createdAt: string;
}

export type NotificationType =
  | 'event_updated'
  | 'event_cancelled'
  | 'event_reminder'
  | 'waitlist_promoted'
  | 'announcement'
  | 'organizer_approved'
  | 'organizer_rejected';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  event: string | null;
  readAt: string | null;
  createdAt: string;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface OrganizerApplication {
  id: string;
  user: string | { id: string; name: string; email: string; avatarUrl: string; role: Role };
  organization: string;
  reason: string;
  status: ApplicationStatus;
  reviewedBy: { id: string; name: string } | null;
  reviewedAt: string | null;
  reviewNote: string;
  createdAt: string;
}

export interface OrganizedEvent extends SyncEvent {
  stats: { going: number; waitlisted: number; checkedIn: number };
}

export interface OrganizerOverview {
  stats: {
    totalEvents: number;
    upcomingEvents: number;
    drafts: number;
    totalRegistrations: number;
    waitlisted: number;
    attendanceRate: number | null;
  };
  events: OrganizedEvent[];
}

export interface PlatformStats {
  users: { total: number; byRole: Record<Role, number>; suspended: number };
  events: { total: number; upcoming: number };
  registrations: number;
  pendingApplications: number;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Page<T> {
  items: T[];
  meta: PageMeta;
}
