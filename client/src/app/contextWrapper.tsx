'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';
import { LocationProvider } from '@/context/LocationContext';

export default function ContextWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EventProvider>
        <LocationProvider>
          {children}
          <ToastContainer position="top-right" autoClose={3500} />
        </LocationProvider>
      </EventProvider>
    </AuthProvider>
  );
}
