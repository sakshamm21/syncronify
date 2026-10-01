'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { SETTINGS_ITEM, isActive, visibleSections, type NavItem } from './nav';

function NavLink({ item, onNavigate, layoutGroup }: { item: NavItem; onNavigate?: () => void; layoutGroup: string }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
        active ? 'text-foreground' : 'text-muted hover:bg-surface-muted hover:text-foreground'
      )}
    >
      {active && (
        <motion.span
          layoutId={`nav-active-${layoutGroup}`}
          className="absolute inset-0 rounded-xl border border-border bg-surface shadow-soft"
          transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
        />
      )}
      <Icon className={cn('relative size-[18px]', active && 'text-primary')} />
      <span className="relative">{item.label}</span>
    </Link>
  );
}

/** Navigation list; rendered in the desktop sidebar and the mobile drawer. */
export default function Sidebar({ onNavigate, layoutGroup = 'desktop' }: { onNavigate?: () => void; layoutGroup?: string }) {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col gap-6 px-3 py-5">
      <Logo href="/dashboard" className="px-3" />
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {visibleSections(user?.role).map((section, i) => (
          <div key={section.title ?? i}>
            {section.title && <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-subtle">{section.title}</p>}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={onNavigate} layoutGroup={layoutGroup} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <NavLink item={SETTINGS_ITEM} onNavigate={onNavigate} layoutGroup={layoutGroup} />
    </div>
  );
}
