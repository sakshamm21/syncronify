'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar/Navbar';
import Login from '@/components/Login/Login';
import UserRegister from '@/components/UserRegister/UserRegister';
import VerifyEmail from '@/components/Auth/VerifyEmail';
import ForgotPassword from '@/components/Auth/ForgotPassword';
import { useAuth } from '@/context/AuthContext';
import { ROLE_HOME } from '@/lib/format';
import type { User } from '@/lib/api';

type Step =
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'verify'; email: string; devCode?: string; sendOnMount?: boolean }
  | { name: 'forgot'; email: string };

function AuthenticationFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, status } = useAuth();
  const [step, setStep] = useState<Step>(params.get('mode') === 'register' ? { name: 'register' } : { name: 'login' });

  // Only follow same-site relative paths to avoid open redirects.
  const next = params.get('next');
  const destinationFor = (u: User) => (next && next.startsWith('/') && !next.startsWith('//') ? next : ROLE_HOME[u.role]);

  useEffect(() => {
    if (status === 'authenticated' && user && step.name !== 'verify') router.replace(destinationFor(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user]);

  const onSignedIn = (signedIn: User) => {
    toast.success(`Welcome, ${signedIn.name.split(' ')[0]}!`);
    router.replace(destinationFor(signedIn));
  };

  switch (step.name) {
    case 'register':
      return (
        <UserRegister
          onSwitchToLogin={() => setStep({ name: 'login' })}
          onRegistered={(result) => setStep({ name: 'verify', email: result.email, devCode: result.devCode })}
        />
      );
    case 'verify':
      return (
        <VerifyEmail
          email={step.email}
          devCode={step.devCode}
          sendOnMount={step.sendOnMount}
          onVerified={onSignedIn}
          onBack={() => setStep({ name: 'login' })}
        />
      );
    case 'forgot':
      return <ForgotPassword initialEmail={step.email} onBack={() => setStep({ name: 'login' })} />;
    default:
      return (
        <Login
          onSwitchToRegister={() => setStep({ name: 'register' })}
          onForgotPassword={(email) => setStep({ name: 'forgot', email })}
          onNeedsVerification={(email) => setStep({ name: 'verify', email, sendOnMount: true })}
          onSignedIn={onSignedIn}
        />
      );
  }
}

export default function AuthenticationPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 my-8">
        <Suspense fallback={null}>
          <AuthenticationFlow />
        </Suspense>
      </main>
      <footer className="border-t-4 border-black bg-white py-4 text-center text-xs font-bold text-black">
        Syncronify Platform — Account Authentication
      </footer>
    </div>
  );
}
