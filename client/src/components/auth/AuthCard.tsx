import React from 'react';
import { FadeIn } from '@/components/ui/motion';

interface AuthCardProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Heading + form body + footer link, shared by every step of the sign-in flow. */
export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <FadeIn key={title} className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
    </FadeIn>
  );
}

export const linkClass = 'font-medium text-primary hover:text-primary-hover underline-offset-4 hover:underline';
