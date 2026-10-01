import React from 'react';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'soft';
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover',
  secondary: 'bg-surface text-foreground border border-border shadow-soft hover:bg-surface-muted hover:border-border-strong',
  outline: 'border border-border-strong text-foreground hover:bg-surface-muted',
  ghost: 'text-muted hover:text-foreground hover:bg-surface-muted',
  soft: 'bg-primary-soft text-primary-soft-foreground hover:brightness-95 dark:hover:brightness-110',
  danger: 'bg-danger text-white shadow-soft hover:brightness-95',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
  icon: 'size-10 rounded-xl',
  'icon-sm': 'size-8 rounded-lg',
};

export function buttonClasses({ variant = 'primary', size = 'md', className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    'inline-flex items-center justify-center font-medium whitespace-nowrap select-none',
    'transition-[background-color,border-color,color,box-shadow,transform,filter] duration-150 active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
    variants[variant],
    sizes[size],
    className
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({ variant, size, loading, className, children, disabled, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} disabled={disabled || loading} className={buttonClasses({ variant, size, className })} {...props}>
      {loading && <LoaderCircle className="animate-spin" />}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
