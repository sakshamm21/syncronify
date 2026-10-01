'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaSearch, FaChartBar, FaUsers, FaInbox } from 'react-icons/fa';
import Navbar from '@/components/Navbar/Navbar';
import SideBar, { type SidebarTab } from '@/components/Sidebar/Sidebar';
import { useAuth } from '@/context/AuthContext';
import {
  adminApi,
  errorMessage,
  type OrganizerApplication,
  type PageMeta,
  type PlatformStats,
  type Role,
  type User,
  type UserStatus,
} from '@/lib/api';
import { ROLE_LABELS, formatDay, formatRelative } from '@/lib/format';

const TABS: SidebarTab[] = [
  { id: 'overview', name: 'Overview', icon: <FaChartBar /> },
  { id: 'users', name: 'Users', icon: <FaUsers /> },
  { id: 'applications', name: 'Organizer Requests', icon: <FaInbox /> },
];

function Overview({ onOpen }: { onOpen: (tab: string) => void }) {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    adminApi.stats().then(setStats).catch((err) => toast.error(errorMessage(err)));
  }, []);

  if (!stats) return <p className="text-xs font-bold">Loading…</p>;

  const cards = [
    { label: 'Members', value: stats.users.byRole.member },
    { label: 'Organizers', value: stats.users.byRole.organizer },
    { label: 'Admins', value: stats.users.byRole.admin },
    { label: 'Suspended', value: stats.users.suspended },
    { label: 'Upcoming events', value: stats.events.upcoming },
    { label: 'Public events (all time)', value: stats.events.total },
    { label: 'Registrations', value: stats.registrations },
  ];

  return (
    <div className="space-y-6">
      {stats.pendingApplications > 0 && (
        <button
          onClick={() => onOpen('applications')}
          className="w-full text-left brutal-card bg-[#FFE600] border-4 border-black p-4 font-black text-sm uppercase"
        >
          {stats.pendingApplications} organizer request{stats.pendingApplications === 1 ? '' : 's'} waiting for review →
        </button>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="brutal-card bg-white border-2 border-black p-4 text-center">
            <p className="font-heading font-black text-3xl">{card.value}</p>
            <p className="text-[11px] font-black uppercase mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersDirectory() {
  const { user: me } = useAuth();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      adminApi
        .users({ q: query.trim() || undefined, role: role || undefined, status: status || undefined, page, limit: 20 })
        .then(({ items, meta: m }) => {
          setUsers(items);
          setMeta(m);
        })
        .catch((err) => toast.error(errorMessage(err)));
    }, 250);
    return () => clearTimeout(timer);
  }, [query, role, status, page]);

  async function update(target: User, change: { role?: Role; status?: UserStatus }) {
    if (change.status === 'suspended' && !window.confirm(`Suspend ${target.name}? They will be signed out immediately.`)) return;
    try {
      const updated = await adminApi.updateUser(target.id, change);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success('User updated');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const select = 'bg-white border-2 border-black px-3 py-2.5 font-black text-xs uppercase outline-none';

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3.5 text-xs" />
          <input
            type="search"
            placeholder="Search name, email or organization…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            aria-label="Search users"
            className="w-full bg-white border-2 border-black pl-10 pr-4 py-2.5 font-bold text-xs outline-none brutal-shadow-sm"
          />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value as Role | ''); setPage(1); }} aria-label="Filter by role" className={select}>
          <option value="">All roles</option>
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value as UserStatus | ''); setPage(1); }} aria-label="Filter by status" className={select}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="brutal-card bg-white border-4 border-black overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-black text-white uppercase text-[11px]">
            <tr>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Joined</th>
              <th className="text-left p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = u.id === me?.id;
              return (
                <tr key={u.id} className="border-t-2 border-black">
                  <td className="p-3">
                    <p className="font-black">{u.name} {isMe && <span className="text-gray-500">(you)</span>}</p>
                    <p className="font-bold text-gray-600">{u.email}</p>
                    {u.organization && <p className="font-bold text-[11px]">{u.organization}</p>}
                  </td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      disabled={isMe}
                      onChange={(e) => update(u, { role: e.target.value as Role })}
                      aria-label={`Role for ${u.name}`}
                      className="bg-[#F4F4F0] border-2 border-black p-1.5 font-bold text-xs disabled:opacity-60"
                    >
                      {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 font-bold">{formatDay(u.createdAt)}</td>
                  <td className="p-3">
                    <span className={`brutal-badge ${u.status === 'active' ? 'bg-[#00FF66] text-black' : 'bg-[#FF007A] text-white'}`}>
                      {u.status}
                    </span>
                    {!u.emailVerified && <span className="block text-[10px] font-bold text-gray-500 mt-1">Email unverified</span>}
                  </td>
                  <td className="p-3 text-right">
                    {!isMe && (
                      <button
                        onClick={() => update(u, { status: u.status === 'active' ? 'suspended' : 'active' })}
                        className={`brutal-btn px-3 py-1.5 text-[11px] font-black uppercase ${u.status === 'active' ? 'bg-[#FF007A] text-white' : 'bg-[#00FF66]'}`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Reinstate'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center font-bold">No users match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-xs font-black">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="brutal-btn bg-white px-3 py-1.5 disabled:opacity-50">← Prev</button>
          <span>Page {meta.page} of {meta.totalPages}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} className="brutal-btn bg-white px-3 py-1.5 disabled:opacity-50">Next →</button>
        </div>
      )}
    </div>
  );
}

function Applications() {
  const [filter, setFilter] = useState<OrganizerApplication['status']>('pending');
  const [items, setItems] = useState<OrganizerApplication[] | null>(null);

  const load = useCallback(() => {
    setItems(null);
    adminApi
      .applications({ status: filter, limit: 50 })
      .then(({ items: list }) => setItems(list))
      .catch((err) => toast.error(errorMessage(err)));
  }, [filter]);

  useEffect(load, [load]);

  async function review(application: OrganizerApplication, approve: boolean) {
    const note = approve ? '' : window.prompt('Optional note to the applicant (why it was not approved):') ?? null;
    if (note === null) return;
    try {
      await (approve ? adminApi.approve(application.id) : adminApi.reject(application.id, note));
      toast.success(approve ? 'Approved. They can now publish events.' : 'Request declined');
      setItems((prev) => prev?.filter((a) => a.id !== application.id) ?? null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`brutal-btn px-3 py-1.5 text-[11px] font-black uppercase ${filter === s ? 'bg-[#FFE600]' : 'bg-white'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {!items ? (
        <p className="text-xs font-bold">Loading…</p>
      ) : items.length === 0 ? (
        <p className="brutal-card bg-white border-2 border-black p-8 text-center text-sm font-bold">
          {filter === 'pending' ? 'No requests waiting. 🎉' : `No ${filter} requests.`}
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((a) => {
            const applicant = typeof a.user === 'string' ? null : a.user;
            return (
              <article key={a.id} className="brutal-card bg-white border-4 border-black p-5 space-y-3">
                <div>
                  <p className="font-heading font-black text-lg">{a.organization}</p>
                  <p className="text-xs font-bold">
                    {applicant?.name} · {applicant?.email}
                  </p>
                  <p className="text-[11px] font-bold text-gray-500">Requested {formatRelative(a.createdAt)}</p>
                </div>
                {a.reason && <p className="text-xs font-medium bg-[#F4F4F0] border-2 border-black p-3 whitespace-pre-wrap">{a.reason}</p>}
                {a.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button onClick={() => review(a, true)} className="brutal-btn bg-[#00FF66] px-4 py-2 text-xs font-black uppercase">Approve</button>
                    <button onClick={() => review(a, false)} className="brutal-btn bg-white px-4 py-2 text-xs font-black uppercase">Decline</button>
                  </div>
                ) : (
                  <p className="text-[11px] font-bold">
                    {a.status === 'approved' ? 'Approved' : 'Declined'} by {a.reviewedBy?.name ?? 'an admin'}
                    {a.reviewedAt ? ` on ${formatDay(a.reviewedAt)}` : ''}
                    {a.reviewNote ? `: "${a.reviewNote}"` : ''}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlatformAdminConsole() {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get('tab');
  const activeTab = TABS.some((t) => t.id === requested) ? requested! : 'overview';
  const setTab = (tab: string) => router.replace(`/application-admin-dashboard?tab=${tab}`);

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans selection:bg-[#FFE600] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        <SideBar activeTab={activeTab} setActiveTab={setTab} tabs={TABS} />
        <main className="flex-1 space-y-6 min-w-0">
          <div className="brutal-card bg-[#FF007A] text-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
            <h1 className="font-heading font-black text-2xl uppercase tracking-tight">Super Admin Console</h1>
            <p className="text-xs font-bold mt-1">Manage people, approve organizers and keep an eye on platform activity.</p>
          </div>
          {activeTab === 'overview' && <Overview onOpen={setTab} />}
          {activeTab === 'users' && <UsersDirectory />}
          {activeTab === 'applications' && <Applications />}
        </main>
      </div>
    </div>
  );
}

export default function PlatformAdminPage() {
  return (
    <Suspense fallback={null}>
      <PlatformAdminConsole />
    </Suspense>
  );
}
