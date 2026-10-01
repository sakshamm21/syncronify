'use client';

import { ThemeProvider, useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';
import { CreateEventProvider } from '@/components/events/CreateEventDialog';

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      richColors
      closeButton
      toastOptions={{ classNames: { toast: 'rounded-2xl! font-sans!' } }}
    />
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <EventProvider>
          <CreateEventProvider>
            {children}
            <ThemedToaster />
          </CreateEventProvider>
        </EventProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
