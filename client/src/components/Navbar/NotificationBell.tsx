'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaBell } from 'react-icons/fa';
import { useAuth, usePolling, useSocketEvent } from '@/context/AuthContext';
import { notificationsApi, type AppNotification } from '@/lib/api';
import { formatRelative } from '@/lib/format';

const POLL_MS = 30_000;

export default function NotificationBell() {
  const { realtime, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  // Ids already shown, so polling only announces genuinely new notifications.
  const seen = useRef<Set<string> | null>(null);

  const announce = useCallback(
    (notification: AppNotification) => {
      toast.info(notification.title);
      // An approved organiser application changes the user's role.
      if (notification.type === 'organizer_approved') refreshUser().catch(() => {});
    },
    [refreshUser]
  );

  const load = useCallback(async () => {
    try {
      const { items: latest, meta } = await notificationsApi.list({ limit: 10 });
      if (seen.current) latest.filter((n) => !seen.current!.has(n.id)).forEach(announce);
      seen.current = new Set(latest.map((n) => n.id));
      setItems(latest);
      setUnread(meta.unread);
    } catch {
      // The bell is non-critical; keep the last known state.
    }
  }, [announce]);

  useEffect(() => {
    load();
  }, [load]);

  usePolling(load, POLL_MS, realtime === 'polling');

  useSocketEvent<AppNotification>('notification:new', (notification) => {
    seen.current?.add(notification.id);
    setItems((prev) => [notification, ...prev].slice(0, 10));
    setUnread((n) => n + 1);
    announce(notification);
  });

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  async function markRead(notification: AppNotification) {
    if (notification.readAt) return;
    setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n)));
    setUnread((n) => Math.max(n - 1, 0));
    await notificationsApi.markRead(notification.id).catch(load);
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnread(0);
    await notificationsApi.markAllRead().catch(load);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        className="brutal-btn bg-white text-black p-2 text-sm relative"
      >
        <FaBell />
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#FF007A] text-white text-[10px] font-black border-2 border-black min-w-[20px] h-5 px-1 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border-4 border-black shadow-[6px_6px_0px_#000] z-50">
          <div className="flex items-center justify-between border-b-2 border-black p-3">
            <span className="font-heading font-black text-sm uppercase">Notifications</span>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="text-[11px] font-bold underline">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items.length === 0 && <li className="p-4 text-xs font-bold text-gray-600">You&apos;re all caught up.</li>}
            {items.map((n) => {
              const body = (
                <>
                  <p className="text-xs font-black">{n.title}</p>
                  {n.body && <p className="text-[11px] font-medium text-gray-700 line-clamp-2">{n.body}</p>}
                  <p className="text-[10px] font-bold text-gray-500 mt-1">{formatRelative(n.createdAt)}</p>
                </>
              );
              const className = `block w-full text-left p-3 border-b border-black ${n.readAt ? 'bg-white' : 'bg-[#FFE600]/30'} hover:bg-[#00F0FF]/20`;
              return (
                <li key={n.id}>
                  {n.event ? (
                    <Link href={`/events/${n.event}`} onClick={() => markRead(n)} className={className}>
                      {body}
                    </Link>
                  ) : (
                    <button type="button" onClick={() => markRead(n)} className={className}>
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
