import React from 'react';
import { cn } from '@/lib/cn';

const control =
  'w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-subtle shadow-soft ' +
  'transition-[border-color,box-shadow] duration-150 outline-none ' +
  'focus:border-primary focus:ring-4 focus:ring-ring/20 aria-[invalid=true]:border-danger disabled:opacity-60';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(control, 'h-11', className)} {...props} />;
  }
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(control, 'py-2.5 min-h-24 resize-y leading-relaxed', className)} {...props} />;
  }
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return <select ref={ref} className={cn(control, 'h-11 pr-8 cursor-pointer', className)} {...props} />;
  }
);

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('block text-sm font-medium text-foreground mb-1.5', className)} {...props} />;
}

interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + hint/error, consistently spaced. */
export function Field({ label, htmlFor, hint, error, className, children }: FieldProps) {
  return (
    <div className={className}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

/** Inline form-level error. */
export function FormAlert({ message, tone = 'danger' }: { message?: string | null; tone?: 'danger' | 'success' | 'info' }) {
  if (!message) return null;
  const tones = {
    danger: 'bg-danger-soft text-danger border-danger/20',
    success: 'bg-success-soft text-success border-success/20',
    info: 'bg-primary-soft text-primary-soft-foreground border-primary/20',
  };
  return (
    <p role="alert" className={cn('rounded-xl border px-3.5 py-2.5 text-sm', tones[tone])}>
      {message}
    </p>
  );
}
