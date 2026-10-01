'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bell, CalendarCheck, CalendarPlus, Compass, Hourglass, Megaphone, MessagesSquare, QrCode, Sparkles, Ticket } from 'lucide-react';
import PublicHeader from '@/components/shell/PublicHeader';
import { LogoMark } from '@/components/shell/Logo';
import FeaturedEvents from '@/components/landing/FeaturedEvents';
import { ButtonLink } from '@/components/ui/button';
import { Reveal, motionEase } from '@/components/ui/motion';
import { useAuth } from '@/context/AuthContext';
import { APP_HOME } from '@/lib/format';
import { cn } from '@/lib/cn';

const FEATURES = [
  {
    icon: Compass,
    title: 'Discover what’s on',
    body: 'Search every campus event, filter by what you love, and get picks based on your interests.',
    className: 'md:col-span-2',
    accent: 'from-indigo-500/15 to-transparent',
  },
  {
    icon: Hourglass,
    title: 'Waitlists that run themselves',
    body: 'Full? Join the waitlist. When a spot opens you’re moved in and told instantly.',
    accent: 'from-amber-500/15 to-transparent',
  },
  {
    icon: Bell,
    title: 'Never miss a change',
    body: 'Reminders the day before, plus instant updates if the time or venue moves.',
    accent: 'from-emerald-500/15 to-transparent',
  },
  {
    icon: MessagesSquare,
    title: 'A group chat for every event',
    body: 'Ask the organizer, find your people, and get announcements in one place.',
    className: 'md:col-span-2',
    accent: 'from-fuchsia-500/15 to-transparent',
  },
  {
    icon: QrCode,
    title: 'Tools for organizers',
    body: 'Publish, cap capacity, check people in at the door, export attendees, and see who actually showed up.',
    className: 'md:col-span-2',
    accent: 'from-sky-500/15 to-transparent',
  },
  {
    icon: CalendarPlus,
    title: 'Your calendar, synced',
    body: 'Everything you’re going to on one schedule, and one tap to add it to Google or Apple Calendar.',
    accent: 'from-violet-500/15 to-transparent',
  },
];

const STEPS = [
  { icon: Sparkles, title: 'Create your account', body: 'Sign up with your email and pick what you’re into.' },
  { icon: Ticket, title: 'RSVP in a tap', body: 'Join events, or the waitlist, and they land on your schedule.' },
  { icon: Megaphone, title: 'Host your own', body: 'Apply to be an organizer and run events end to end.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const primaryHref = user ? APP_HOME : '/authentication?mode=register';

  return (
    <div className="min-h-screen overflow-x-hidden">
      <PublicHeader />

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute -left-40 -top-40 size-[36rem] rounded-full bg-indigo-500/25 blur-3xl"
            animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-32 top-20 size-[32rem] rounded-full bg-fuchsia-500/20 blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pt-24">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: motionEase }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-sm text-muted shadow-soft backdrop-blur"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Live events on campus right now
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: motionEase, delay: 0.05 }}
              className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Everything on campus,{' '}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">in sync.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: motionEase, delay: 0.15 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
            >
              Find events worth going to, RSVP in a tap, and get reminded. Organizers get waitlists, check-in and a group chat that run themselves.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: motionEase, delay: 0.25 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <ButtonLink href={primaryHref} size="lg" className="group">
                {user ? 'Open Syncronify' : 'Get started free'}
                <ArrowRight className="transition group-hover:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href={user ? '/explore' : '/authentication'} size="lg" variant="secondary">
                {user ? 'Explore events' : 'Sign in'}
              </ButtonLink>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"
            >
              {['Free for students', 'Works on any device', 'Light & dark mode'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CalendarCheck className="size-4 text-primary" /> {t}
                </span>
              ))}
            </motion.div>
          </div>

          <FeaturedEvents />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Built for how campus actually works</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">One place for going out and putting on</h2>
          <p className="mt-4 text-muted">No more scattered group chats, screenshots of posters, or forgotten RSVPs.</p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05} className={cn('group relative overflow-hidden rounded-3xl border border-border bg-surface p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-lifted', f.className)}>
              <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition duration-500 group-hover:opacity-100', f.accent)} />
              <div className="relative">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground transition duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Up and running in a minute</h2>
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1} className="relative text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 text-white shadow-lifted">
                  <s.icon className="size-6" />
                </span>
                <p className="mt-2 text-xs font-medium text-subtle">Step {i + 1}</p>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-muted">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-[#0d0b1f] px-8 py-16 text-center text-white sm:px-16">
          <div className="absolute -left-20 -top-20 size-80 rounded-full bg-indigo-600/50 blur-3xl" />
          <div className="absolute -bottom-24 right-0 size-80 rounded-full bg-fuchsia-600/40 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-semibold sm:text-4xl">Your next favourite event is already on.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">Join in a minute. It&apos;s free.</p>
            <ButtonLink href={primaryHref} size="lg" className="mt-8 bg-white text-zinc-900 hover:bg-white/90">
              {user ? 'Open Syncronify' : 'Create your account'} <ArrowRight />
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
          <span className="flex items-center gap-2">
            <LogoMark className="size-6 rounded-lg" /> Syncronify
          </span>
          <p>Built for CS253 · IIT Kanpur · © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
