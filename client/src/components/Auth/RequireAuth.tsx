'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_HOME } from '@/lib/format';
import type { Role } from '@/lib/api';

interface RequireAuthProps {
  /** Roles allowed on this page; omit to allow any signed-in user. */
  roles?: Role[];
  children: React.ReactNode;
}

/** Sends anonymous users to sign in, and users without the right role to their own home. */
export default function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = Boolean(user && (!roles || roles.includes(user.role)));

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace(`/authentication?next=${encodeURIComponent(pathname)}`);
    } else if (status === 'authenticated' && user && !allowed) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [status, user, allowed, router, pathname]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F0]">
        <p className="brutal-badge bg-[#FFE600] text-black text-xs font-black uppercase">Loading your workspace…</p>
      </div>
    );
  }
  return <>{children}</>;
}
