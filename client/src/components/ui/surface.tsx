import React from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-border bg-surface shadow-soft', className)} {...props} />;
}

export function CardHeader({ title, description, action, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 p-5 pb-0', className)}>
      <div className="min-w-0">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-muted border-border',
  primary: 'bg-primary-soft text-primary-soft-foreground border-transparent',
  success: 'bg-success-soft text-success border-transparent',
  warning: 'bg-warning-soft text-warning border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
};

export function Badge({ tone = 'neutral', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3', badgeTones[tone], className)}
      {...props}
    />
  );
}

export function Avatar({ name, src, size = 36, className }: { name: string; src?: string; size?: number; className?: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const style = { width: size, height: size, fontSize: Math.max(size * 0.38, 11) };
  return src ? (
    <img src={src} alt="" style={style} className={cn('rounded-full object-cover ring-1 ring-border', className)} />
  ) : (
    <span
      style={style}
      className={cn('inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-fuchsia-500 font-semibold text-white', className)}
    >
      {initials || '?'}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-[linear-gradient(90deg,var(--surface-muted)_25%,var(--border)_50%,var(--surface-muted)_75%)] bg-[length:200%_100%] animate-shimmer',
        className
      )}
    />
  );
}

export function EmptyState({ icon, title, description, action, className }: { icon: React.ReactNode; title: string; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong px-6 py-14 text-center', className)}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground [&_svg]:size-6">{icon}</div>
      <p className="text-base font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon, hint }: { label: string; value: React.ReactNode; icon: React.ReactNode; hint?: string }) {
  return (
    <Card className="h-full p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground [&_svg]:size-4">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}
