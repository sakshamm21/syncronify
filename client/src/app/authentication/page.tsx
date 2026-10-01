'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import AuthLayout from '@/components/auth/AuthLayout';
import SignInForm from '@/components/auth/SignInForm';
import RegisterForm from '@/components/auth/RegisterForm';
import VerifyEmail from '@/components/auth/VerifyEmail';
import ForgotPassword from '@/components/auth/ForgotPassword';
import { useAuth } from '@/context/AuthContext';
import { APP_HOME } from '@/lib/format';
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
  const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : APP_HOME;

  useEffect(() => {
    if (status === 'authenticated' && user && step.name !== 'verify') router.replace(destination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user]);

  const onSignedIn = (signedIn: User) => {
    toast.success(`Welcome, ${signedIn.name.split(' ')[0]}!`);
    router.replace(destination);
  };

  switch (step.name) {
    case 'register':
      return (
        <RegisterForm
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
        <SignInForm
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
    <AuthLayout>
      <Suspense fallback={null}>
        <AuthenticationFlow />
      </Suspense>
    </AuthLayout>
  );
}
