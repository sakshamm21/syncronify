import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

/** Two interlocking rings: people and events, in sync. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 shadow-soft', className)}>
      <svg viewBox="0 0 24 24" fill="none" className="size-[62%]" aria-hidden="true">
        <circle cx="9" cy="12" r="5.25" stroke="white" strokeWidth="2.2" />
        <circle cx="15" cy="12" r="5.25" stroke="white" strokeOpacity="0.75" strokeWidth="2.2" />
      </svg>
    </span>
  );
}

export function Logo({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-2.5', className)}>
      <LogoMark className="transition-transform duration-300 group-hover:rotate-[-8deg]" />
      <span className="text-[17px] font-semibold tracking-tight">Syncronify</span>
    </Link>
  );
}
