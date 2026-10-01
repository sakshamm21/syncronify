import React from 'react';
import RequireAuth from '@/components/Auth/RequireAuth';

export default function OrganizerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['organizer', 'admin']}>{children}</RequireAuth>;
}
