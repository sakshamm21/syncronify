'use client';

import { useAuth } from '@/context/AuthContext';
import { ButtonLink } from '@/components/ui/button';
import { APP_HOME } from '@/lib/format';
import { Logo } from './Logo';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

/** Header for public pages (landing, shared event pages). */
export default function PublicHeader() {
  const { user, status } = useAuth();
  return (
    <header className="sticky top-0 z-30 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo href={user ? APP_HOME : '/'} />
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <>
              <ButtonLink href={APP_HOME} variant="secondary" size="sm" className="mr-1">
                Open app
              </ButtonLink>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            status === 'anonymous' && (
              <>
                <ButtonLink href="/authentication" variant="ghost" size="sm">
                  Sign in
                </ButtonLink>
                <ButtonLink href="/authentication?mode=register" size="sm">
                  Join free
                </ButtonLink>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
