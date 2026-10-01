import RequireAuth from '@/components/auth/RequireAuth';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['organizer', 'admin']}>{children}</RequireAuth>;
}
