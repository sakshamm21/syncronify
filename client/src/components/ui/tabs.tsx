'use client';

import React, { useId } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: React.ReactNode; count?: number }[];
  className?: string;
  size?: 'sm' | 'md';
}

/** Pill tabs with a sliding highlight. */
export function Segmented<T extends string>({ value, onChange, options, className, size = 'md' }: SegmentedProps<T>) {
  const id = useId();
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-xl border border-border bg-surface-muted p-1', className)} role="tablist">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative whitespace-nowrap rounded-lg font-medium transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
              active ? 'text-foreground' : 'text-muted hover:text-foreground'
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-lg bg-surface shadow-soft"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {option.label}
              {option.count !== undefined && <span className="text-xs text-subtle tabular-nums">{option.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface ChipsProps<T extends string> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: { value: T; label: string }[];
  allLabel?: string;
}

/** Horizontally scrolling filter chips. */
export function FilterChips<T extends string>({ value, onChange, options, allLabel = 'All' }: ChipsProps<T>) {
  const all = [{ value: null as T | null, label: allLabel }, ...options];
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {all.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value ?? 'all'}
            onClick={() => onChange(option.value)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'border-transparent bg-foreground text-background'
                : 'border-border bg-surface text-muted hover:border-border-strong hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
