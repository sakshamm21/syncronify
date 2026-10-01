'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Plus, Search, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCreateEvent } from '@/components/events/CreateEventDialog';
import { Button } from '@/components/ui/button';
import { motionEase } from '@/components/ui/motion';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/explore${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
      }}
      className="relative w-full max-w-md"
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search events, venues, tags…"
        aria-label="Search events"
        className="h-10 w-full rounded-xl border border-transparent bg-surface-muted pl-10 pr-3 text-sm outline-none transition placeholder:text-subtle focus:border-border focus:bg-surface focus:shadow-soft"
      />
    </form>
  );
}

/** Signed-in layout: sidebar, top bar and an animated content area. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { openCreateEvent } = useCreateEvent();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-background lg:block">
        <Sidebar />
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 border-r border-border bg-background shadow-overlay"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: motionEase }}
            >
              <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="absolute right-3 top-4">
                <X />
              </Button>
              <Sidebar layoutGroup="mobile" onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="lg:hidden">
              <Menu />
            </Button>
            <div className="hidden flex-1 sm:block">
              <SearchBox />
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Button onClick={() => openCreateEvent()} size="md" className="hidden sm:inline-flex">
                <Plus /> {user?.role === 'member' ? 'Add event' : 'New event'}
              </Button>
              <Button onClick={() => openCreateEvent()} size="icon" aria-label="New event" className="sm:hidden">
                <Plus />
              </Button>
              <ThemeToggle />
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: motionEase }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
