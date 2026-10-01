'use client';

import React, { useState } from 'react';
import { FaSignInAlt, FaBolt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { ApiError, errorMessage, type User } from '@/lib/api';
import AuthCard, { FormError, inputClass, labelClass, linkButtonClass, primaryButtonClass } from '@/components/Auth/AuthCard';

interface LoginProps {
  onSwitchToRegister: () => void;
  onForgotPassword: (email: string) => void;
  onNeedsVerification: (email: string) => void;
  onSignedIn: (user: User) => void;
}

// Accounts created by `npm run seed` on the server. Shown only when enabled.
const DEMO_ACCOUNTS = [
  { label: 'Member', email: 'member@syncronify.dev' },
  { label: 'Organizer', email: 'organizer@syncronify.dev' },
  { label: 'Super Admin', email: 'admin@syncronify.dev' },
];
const DEMO_PASSWORD = 'syncronify123';
const showDemoAccounts = process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === 'true';

export default function Login({ onSwitchToRegister, onForgotPassword, onNeedsVerification, onSignedIn }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      onSignedIn(await login(email, password));
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED') {
        onNeedsVerification(email);
        return;
      }
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Sign In"
      subtitle={
        <>
          New to Syncronify?{' '}
          <button type="button" onClick={onSwitchToRegister} className={linkButtonClass}>
            Create an account →
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@college.edu"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className={labelClass}>Password</label>
            <button type="button" onClick={() => onForgotPassword(email)} className="text-[11px] font-bold underline mb-1">
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
            required
          />
        </div>

        <FormError message={error} />

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          <FaSignInAlt />
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {showDemoAccounts && (
        <div className="mt-6 pt-4 border-t-2 border-black space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1">
            <FaBolt className="text-[#FF007A]" /> Demo accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(DEMO_PASSWORD);
                }}
                className="brutal-btn text-[10px] py-1.5 uppercase bg-[#F4F4F0] text-black hover:bg-[#FFE600]"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </AuthCard>
  );
}
