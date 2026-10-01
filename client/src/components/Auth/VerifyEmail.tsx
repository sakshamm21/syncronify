'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaKey } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { ApiError, errorMessage, type User } from '@/lib/api';
import AuthCard, { FormError, inputClass, labelClass, linkButtonClass, primaryButtonClass } from './AuthCard';

interface VerifyEmailProps {
  email: string;
  /** Set only in development when the server can't send email. */
  devCode?: string;
  /** Send a fresh code on mount (e.g. when an unverified user tries to sign in). */
  sendOnMount?: boolean;
  onVerified: (user: User) => void;
  onBack: () => void;
}

const RESEND_SECONDS = 30;

export default function VerifyEmail({ email, devCode: initialDevCode, sendOnMount, onVerified, onBack }: VerifyEmailProps) {
  const { verifyEmail, resendVerification } = useAuth();
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState(initialDevCode);
  const [cooldown, setCooldown] = useState(sendOnMount ? 0 : RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function resend(silent = false) {
    try {
      const result = await resendVerification(email);
      setDevCode(result.devCode);
      setCooldown(RESEND_SECONDS);
      if (!silent) toast.success('A new code is on its way.');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'RESEND_COOLDOWN') {
        setCooldown(30);
        if (silent) return;
      }
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    if (sendOnMount) resend(true);
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      onVerified(await verifyEmail(email, code));
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ALREADY_VERIFIED') {
        toast.info('Your email is already verified. Please sign in.');
        onBack();
        return;
      }
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Check Your Email"
      subtitle={
        <>
          We sent a 6-digit code to <strong>{email}</strong>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {devCode && (
          <div className="bg-[#FFE600] border-2 border-black p-3 text-center brutal-shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider">Email delivery isn't set up yet. Use this code</p>
            <p className="font-heading font-black text-2xl tracking-[0.3em]">{devCode}</p>
          </div>
        )}

        <div>
          <label htmlFor="code" className={`${labelClass} flex items-center gap-1`}>
            <FaKey /> Verification code
          </label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={`${inputClass} font-mono text-center text-lg tracking-[0.4em]`}
            placeholder="000000"
            autoFocus
            required
          />
        </div>

        <FormError message={error} />

        <button type="submit" disabled={loading || code.length !== 6} className={primaryButtonClass}>
          <FaCheckCircle /> {loading ? 'Verifying…' : 'Verify & Continue'}
        </button>

        <div className="flex items-center justify-between text-xs font-bold">
          <button type="button" onClick={onBack} className="underline">
            ← Back
          </button>
          {cooldown > 0 ? (
            <span className="text-gray-600">Resend code in {cooldown}s</span>
          ) : (
            <button type="button" onClick={() => resend()} className={linkButtonClass}>
              Resend code
            </button>
          )}
        </div>
      </form>
    </AuthCard>
  );
}
