'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaUserCheck, FaHourglassHalf, FaCog } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useEventsSync } from '@/context/EventContext';
import { errorMessage, eventsApi, type SyncEvent } from '@/lib/api';

interface RsvpButtonProps {
  event: SyncEvent;
  onChange: (event: SyncEvent) => void;
  className?: string;
}

const base = 'brutal-btn px-4 py-2 text-xs uppercase font-black flex items-center justify-center gap-1.5 disabled:opacity-60';

export default function RsvpButton({ event, onChange, className = '' }: RsvpButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { eventsChanged } = useEventsSync();
  const [pending, setPending] = useState(false);

  if (event.visibility === 'private') return null;

  if (event.viewer.canManage) {
    return (
      <Link href={`/admin-dashboard/${event.id}`} className={`${base} bg-[#00F0FF] text-black ${className}`}>
        <FaCog /> Manage
      </Link>
    );
  }
  if (event.status === 'cancelled') {
    return <span className={`${base} bg-[#FF007A] text-white cursor-default ${className}`}>Cancelled</span>;
  }
  if (event.isPast) {
    return <span className={`${base} bg-[#F4F4F0] text-black cursor-default ${className}`}>Ended</span>;
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
      if (!registration && updated.viewer.registration === 'going') toast.success("You're going! It's on your schedule.");
      else if (!registration) toast.info("It's full, so you're on the waitlist. We'll notify you if a spot opens.");
      else toast.info(registration === 'going' ? 'Your registration was cancelled.' : 'You left the waitlist.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  const { label, style, icon } =
    registration === 'going'
      ? { label: 'Going', style: 'bg-[#00FF66] text-black', icon: <FaUserCheck /> }
      : registration === 'waitlisted'
        ? { label: 'Waitlisted', style: 'bg-[#FFE600] text-black', icon: <FaHourglassHalf /> }
        : event.spotsLeft === 0
          ? { label: 'Join Waitlist', style: 'bg-white text-black hover:bg-[#FFE600]', icon: null }
          : { label: '+ RSVP', style: 'bg-[#FFE600] text-black hover:bg-[#00F0FF]', icon: null };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={registration ? 'Click to cancel your registration' : undefined}
      className={`${base} ${style} ${className}`}
    >
      {icon}
      {pending ? 'Saving…' : label}
    </button>
  );
}
