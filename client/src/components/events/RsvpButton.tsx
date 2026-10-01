'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Hourglass, Settings2, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEventsSync } from '@/context/EventContext';
import { errorMessage, eventsApi, type SyncEvent } from '@/lib/api';
import { Button, ButtonLink } from '@/components/ui/button';

interface RsvpButtonProps {
  event: SyncEvent;
  onChange: (event: SyncEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** One button for every registration state: RSVP, join waitlist, going, waitlisted, manage. */
export default function RsvpButton({ event, onChange, size = 'sm', className }: RsvpButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { eventsChanged } = useEventsSync();
  const [pending, setPending] = useState(false);

  if (event.visibility === 'private') return null;

  if (event.viewer.canManage) {
    return (
      <ButtonLink href={`/organizer/events/${event.id}`} variant="secondary" size={size} className={className}>
        <Settings2 /> Manage
      </ButtonLink>
    );
  }
  if (event.status === 'cancelled' || event.isPast) {
    return (
      <Button variant="secondary" size={size} disabled className={className}>
        {event.status === 'cancelled' ? 'Cancelled' : 'Ended'}
      </Button>
    );
  }

  const registration = event.viewer.registration;

  async function toggle() {
    if (!user) {
      router.push(`/authentication?next=${encodeURIComponent(`/events/${event.id}`)}`);
      return;
    }
    setPending(true);
    try {
      const updated = registration ? await eventsApi.unregister(event.id) : await eventsApi.register(event.id);
      onChange(updated);
      eventsChanged();
      if (!registration && updated.viewer.registration === 'going') toast.success("You're going!", { description: "It's on your schedule. We'll remind you the day before." });
      else if (!registration) toast.info("You're on the waitlist", { description: "It's full right now. We'll move you in and tell you if a spot opens." });
      else toast(registration === 'going' ? 'Registration cancelled' : 'You left the waitlist');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  if (registration) {
    return (
      <Button
        variant="soft"
        size={size}
        loading={pending}
        onClick={toggle}
        title="Click to cancel"
        className={`group/rsvp ${className ?? ''}`}
      >
        {!pending && (registration === 'going' ? <Check /> : <Hourglass />)}
        <span className="group-hover/rsvp:hidden">{registration === 'going' ? 'Going' : 'Waitlisted'}</span>
        <span className="hidden group-hover/rsvp:inline">{registration === 'going' ? 'Cancel RSVP' : 'Leave waitlist'}</span>
      </Button>
    );
  }

  return (
    <Button variant={event.spotsLeft === 0 ? 'secondary' : 'primary'} size={size} loading={pending} onClick={toggle} className={className}>
      {!pending && <Plus />}
      {event.spotsLeft === 0 ? 'Join waitlist' : 'RSVP'}
    </Button>
  );
}
