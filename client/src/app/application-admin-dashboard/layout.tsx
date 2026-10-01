import React from 'react';
import RequireAuth from '@/components/Auth/RequireAuth';

export default function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['admin']}>{children}</RequireAuth>;
}
