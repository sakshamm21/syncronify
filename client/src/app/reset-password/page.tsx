'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaKey } from 'react-icons/fa';
import Navbar from '@/components/Navbar/Navbar';
import AuthCard, { FormError, inputClass, labelClass, primaryButtonClass } from '@/components/Auth/AuthCard';
import { useAuth } from '@/context/AuthContext';
import { authApi, errorMessage } from '@/lib/api';
import { ROLE_HOME } from '@/lib/format';

function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const { startSession } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthCard title="Link Missing" subtitle="This page needs the link from your reset email.">
        <Link href="/authentication" className={primaryButtonClass}>
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('The passwords do not match.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = startSession(await authApi.resetPassword({ token, password }));
      toast.success('Password updated. You are signed in.');
      router.replace(ROLE_HOME[user.role]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Choose a New Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className={labelClass}>New password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
            required
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className={labelClass}>Confirm password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <FormError message={error} />
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          <FaKey /> {loading ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 my-8">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
