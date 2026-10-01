'use client';

import React from 'react';
import { motion } from 'motion/react';
import { CalendarCheck, MapPin, Users } from 'lucide-react';
import { Logo } from '@/components/shell/Logo';
import ThemeToggle from '@/components/shell/ThemeToggle';

const FLOATING = [
  { title: 'Design & Build Hackathon', meta: 'Innovation Lab · Sat 9:00', icon: Users, tag: '24 going', x: '8%', y: '12%', delay: 0 },
  { title: 'Live Band Night', meta: 'Open Air Theatre · Fri 18:00', icon: MapPin, tag: 'Waitlist open', x: '40%', y: '33%', delay: 0.15 },
  { title: 'Tech Summit 2026', meta: 'Main Auditorium · Sun 10:00', icon: CalendarCheck, tag: "You're going", x: '14%', y: '54%', delay: 0.3 },
];

/** Split screen: form on the left, an animated brand panel on the right (large screens). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-12">{children}</div>
        <p className="text-xs text-subtle">© {new Date().getFullYear()} Syncronify</p>
      </div>

      <div className="relative hidden overflow-hidden bg-[#0d0b1f] lg:block">
        <div className="absolute -left-24 top-10 size-[28rem] rounded-full bg-indigo-600/40 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/3 size-[26rem] rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/4 size-[24rem] rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:24px_24px]" />

        {FLOATING.map(({ title, meta, icon: Icon, tag, x, y, delay }) => (
          <motion.div
            key={title}
            className="absolute w-72 rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-2xl backdrop-blur-md"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{ opacity: { duration: 0.6, delay }, y: { duration: 6, delay, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{title}</p>
                <p className="truncate text-xs text-white/60">{meta}</p>
              </div>
            </div>
            <span className="mt-3 inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium">{tag}</span>
          </motion.div>
        ))}

        <div className="absolute inset-x-12 bottom-12 text-white">
          <p className="max-w-md text-3xl font-semibold leading-tight tracking-tight">Everything happening on campus, in one calm place.</p>
          <p className="mt-3 max-w-md text-white/60">RSVP in a tap, get reminded, chat with organizers, and never miss the good stuff.</p>
        </div>
      </div>
    </div>
  );
}
