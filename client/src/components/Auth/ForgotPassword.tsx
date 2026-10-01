'use client';

import React, { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { authApi, errorMessage } from '@/lib/api';
import AuthCard, { FormError, inputClass, labelClass, primaryButtonClass } from './AuthCard';

export default function ForgotPassword({ initialEmail = '', onBack }: { initialEmail?: string; onBack: () => void }) {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email);
      setDevResetUrl(result.devResetUrl);
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Reset Password" subtitle="We'll email you a link to choose a new password.">
      {sent ? (
        <div className="space-y-4">
          <p className="bg-[#00FF66] border-2 border-black p-3 text-xs font-bold">
            If an account exists for {email}, a reset link is on its way. It expires in 30 minutes.
          </p>
          {devResetUrl && (
            <a href={devResetUrl} className="block bg-[#FFE600] border-2 border-black p-3 text-xs font-black underline break-all">
              Email delivery isn't set up yet. Open your reset link
            </a>
          )}
          <button type="button" onClick={onBack} className={primaryButtonClass}>
            Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className={labelClass}>Email</label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <FormError message={error} />
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            <FaEnvelope /> {loading ? 'Sending…' : 'Send reset link'}
          </button>
          <button type="button" onClick={onBack} className="w-full text-xs font-bold underline">
            ← Back to sign in
          </button>
        </form>
      )}
    </AuthCard>
  );
}
