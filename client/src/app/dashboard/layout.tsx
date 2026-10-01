import React from 'react';
import RequireAuth from '@/components/Auth/RequireAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
