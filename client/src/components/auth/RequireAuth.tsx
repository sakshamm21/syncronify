'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { APP_HOME } from '@/lib/format';
import type { Role } from '@/lib/api';

interface RequireAuthProps {
  /** Roles allowed on this page; omit to allow any signed-in user. */
  roles?: Role[];
  children: React.ReactNode;
}

/** Sends anonymous users to sign in, and users without the right role back home. */
export default function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = Boolean(user && (!roles || roles.includes(user.role)));

  useEffect(() => {
    if (status === 'anonymous') router.replace(`/authentication?next=${encodeURIComponent(pathname)}`);
    else if (status === 'authenticated' && !allowed) router.replace(APP_HOME);
  }, [status, allowed, router, pathname]);

  if (!allowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        <LoaderCircle className="size-6 animate-spin" aria-label="Loading" />
      </div>
    );
  }
  return <>{children}</>;
}
