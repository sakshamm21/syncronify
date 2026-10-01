'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { motionEase } from './motion';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Fill most of the viewport (maps). */
  tall?: boolean;
}

const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-5xl' };

/** Accessible modal with a fade/scale entrance, Escape to close, and body scroll lock. */
export function Dialog({ open, onClose, title, description, children, footer, size = 'md', tall }: DialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative flex w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-overlay sm:rounded-3xl',
              widths[size],
              tall ? 'h-[92vh]' : 'max-h-[92vh]'
            )}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: motionEase }}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
                <div>
                  {title && <h2 className="text-lg font-semibold">{title}</h2>}
                  {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="-mr-2 -mt-1 flex size-9 items-center justify-center rounded-xl text-muted transition hover:bg-surface-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface-muted/50 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

interface PopoverProps {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

/** Small anchored panel (menus, notification list). Closes on outside click and Escape. */
export function Popover({ trigger, children, align = 'right', className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: motionEase }}
            className={cn(
              'absolute top-full z-50 mt-2 origin-top rounded-2xl border border-border bg-surface-raised shadow-lifted',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MenuItem({ icon, children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      className={cn('flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-foreground transition hover:bg-surface-muted [&_svg]:size-4 [&_svg]:text-muted', className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  /** Extra inputs (e.g. a message to attendees). */
  children?: React.ReactNode;
}

/** Replaces window.confirm with an on-brand, accessible dialog. */
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, tone = 'danger', children }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      description={description}
      footer={
        <>
          <button onClick={onClose} className="h-10 rounded-xl px-4 text-sm font-medium text-muted transition hover:bg-surface-muted hover:text-foreground">
            Keep it
          </button>
          <button
            onClick={confirm}
            disabled={busy}
            className={cn(
              'h-10 rounded-xl px-4 text-sm font-medium text-white shadow-soft transition disabled:opacity-60',
              tone === 'danger' ? 'bg-danger hover:brightness-95' : 'bg-primary hover:bg-primary-hover'
            )}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      {children && <div className="p-6">{children}</div>}
    </Dialog>
  );
}
