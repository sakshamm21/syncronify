'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';

export default function ContextWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EventProvider>
        {children}
        <ToastContainer position="top-right" autoClose={3500} />
      </EventProvider>
    </AuthProvider>
  );
}
