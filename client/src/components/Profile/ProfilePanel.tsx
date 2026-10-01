'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaUserCog, FaBullhorn, FaKey } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useEventsSync } from '@/context/EventContext';
import { errorMessage, meApi, organizerApi, type CategoryValue, type OrganizerApplication } from '@/lib/api';
import { CATEGORIES, CATEGORY_LABELS, formatDay } from '@/lib/format';

const card = 'brutal-card bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000] space-y-4';
const input = 'w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-xs outline-none focus:bg-white';
const label = 'block text-xs font-black uppercase mb-1';

function ProfileDetails() {
  const { user, setUser } = useAuth();
  const { eventsChanged } = useEventsSync();
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [interests, setInterests] = useState<CategoryValue[]>(user?.interests ?? []);
  const [emailNotifications, setEmailNotifications] = useState(user?.preferences.emailNotifications ?? true);
  const [saving, setSaving] = useState(false);

  const toggleInterest = (value: CategoryValue) =>
    setInterests((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      setUser(await meApi.update({ name, bio, interests, preferences: { emailNotifications } }));
      eventsChanged(); // Recommendations depend on interests.
      toast.success('Profile saved');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className={card}>
      <h2 className="font-heading font-black text-xl uppercase flex items-center gap-2">
        <FaUserCog /> Your Profile
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="profile-name" className={label}>Name</label>
          <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} className={input} required />
        </div>
        <div>
          <span className={label}>Email</span>
          <p className="p-2.5 text-xs font-bold border-2 border-dashed border-black">{user?.email}</p>
        </div>
      </div>
      <div>
        <label htmlFor="profile-bio" className={label}>About you</label>
        <textarea id="profile-bio" rows={2} maxLength={500} value={bio} onChange={(e) => setBio(e.target.value)} className={input} />
      </div>
      <div>
        <span className={label}>Interests</span>
        <p className="text-[11px] font-bold text-gray-600 mb-2">We use these to suggest events you&apos;ll like.</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={interests.includes(c)}
              onClick={() => toggleInterest(c)}
              className={`brutal-btn text-xs px-3 py-1.5 uppercase ${interests.includes(c) ? 'bg-[#FFE600]' : 'bg-[#F4F4F0]'}`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs font-bold">
        <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
        Email me reminders and updates about events I&apos;m attending
      </label>
      <button type="submit" disabled={saving} className="brutal-btn bg-[#00FF66] px-5 py-2.5 text-xs font-black uppercase disabled:opacity-60">
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}

function OrganizerAccess() {
  const { user } = useAuth();
  const [application, setApplication] = useState<OrganizerApplication | null | undefined>(undefined);
  const [organization, setOrganization] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role !== 'member') return;
    organizerApi.latestApplication().then(setApplication).catch(() => setApplication(null));
  }, [user?.role]);

  if (!user) return null;

  if (user.role !== 'member') {
    return (
      <div className={card}>
        <h2 className="font-heading font-black text-xl uppercase flex items-center gap-2">
          <FaBullhorn /> Organizer Access
        </h2>
        <p className="text-xs font-bold">
          You can publish public events{user.organization ? ` for ${user.organization}` : ''}. Use the Organizer Console to manage them.
        </p>
      </div>
    );
  }

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      setApplication(await organizerApi.apply({ organization, reason }));
      toast.success('Application sent. We will notify you once it is reviewed.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const pending = application?.status === 'pending';

  return (
    <div className={card}>
      <h2 className="font-heading font-black text-xl uppercase flex items-center gap-2">
        <FaBullhorn /> Host Your Own Events
      </h2>

      {application && (
        <div
          className={`border-2 border-black p-3 text-xs font-bold ${
            application.status === 'pending' ? 'bg-[#FFE600]' : application.status === 'approved' ? 'bg-[#00FF66]' : 'bg-[#F4F4F0]'
          }`}
        >
          {application.status === 'pending' && `Your application for ${application.organization} (sent ${formatDay(application.createdAt)}) is being reviewed.`}
          {application.status === 'rejected' &&
            `Your last application for ${application.organization} wasn't approved.${application.reviewNote ? ` Note from the reviewer: "${application.reviewNote}"` : ''} You can apply again below.`}
          {application.status === 'approved' && 'Your application was approved. Open the Organizer Console from the sidebar.'}
        </div>
      )}

      {!pending && application !== undefined && (
        <form onSubmit={apply} className="space-y-3">
          <p className="text-xs font-bold">
            Organizers can publish public events, manage RSVPs and waitlists, check people in, and post announcements.
          </p>
          <div>
            <label htmlFor="org-name" className={label}>Club or organization</label>
            <input id="org-name" value={organization} onChange={(e) => setOrganization(e.target.value)} className={input} required minLength={2} />
          </div>
          <div>
            <label htmlFor="org-reason" className={label}>What will you host? (optional)</label>
            <textarea id="org-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className={input} />
          </div>
          <button type="submit" disabled={submitting} className="brutal-btn bg-[#00F0FF] px-5 py-2.5 text-xs font-black uppercase disabled:opacity-60">
            {submitting ? 'Sending…' : 'Apply to be an organizer'}
          </button>
        </form>
      )}
    </div>
  );
}

function ChangePassword() {
  const { startSession } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      startSession(await meApi.changePassword({ currentPassword, newPassword }));
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Password changed. Other devices have been signed out.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className={card}>
      <h2 className="font-heading font-black text-xl uppercase flex items-center gap-2">
        <FaKey /> Change Password
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="current-password" className={label}>Current password</label>
          <input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={input} required />
        </div>
        <div>
          <label htmlFor="new-password" className={label}>New password</label>
          <input id="new-password" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={input} required />
        </div>
      </div>
      <button type="submit" disabled={saving} className="brutal-btn bg-white px-5 py-2.5 text-xs font-black uppercase disabled:opacity-60">
        {saving ? 'Saving…' : 'Update password'}
      </button>
    </form>
  );
}

export default function ProfilePanel() {
  return (
    <div className="space-y-6">
      <ProfileDetails />
      <OrganizerAccess />
      <ChangePassword />
    </div>
  );
}
