'use client';

import React, { useState } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { ApiError, errorMessage, type RegisterResult } from '@/lib/api';
import AuthCard, { FormError, inputClass, labelClass, linkButtonClass, primaryButtonClass } from '@/components/Auth/AuthCard';

interface UserRegisterProps {
  onSwitchToLogin: () => void;
  onRegistered: (result: RegisterResult) => void;
}

type Field = 'name' | 'email' | 'password';

export default function UserRegister({ onSwitchToLogin, onRegistered }: UserRegisterProps) {
  const { register } = useAuth();
  const [form, setForm] = useState<Record<Field, string>>({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      onRegistered(await register(form));
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR') {
        setFieldErrors({
          name: err.fieldMessage('name'),
          email: err.fieldMessage('email'),
          password: err.fieldMessage('password'),
        });
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  const fields: { key: Field; label: string; type: string; placeholder: string; autoComplete: string }[] = [
    { key: 'name', label: 'Full name', type: 'text', placeholder: 'Asha Rao', autoComplete: 'name' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@college.edu', autoComplete: 'email' },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'At least 8 characters', autoComplete: 'new-password' },
  ];

  return (
    <AuthCard
      title="Create Account"
      subtitle={
        <>
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className={linkButtonClass}>
            Sign in →
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={field.key} className={labelClass}>{field.label}</label>
            <input
              id={field.key}
              type={field.type}
              autoComplete={field.autoComplete}
              value={form[field.key]}
              onChange={update(field.key)}
              placeholder={field.placeholder}
              aria-invalid={Boolean(fieldErrors[field.key])}
              className={inputClass}
              required
            />
            {fieldErrors[field.key] && (
              <p className="text-[11px] font-bold text-[#FF007A] mt-1">{fieldErrors[field.key]}</p>
            )}
          </div>
        ))}

        <FormError message={error} />

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          <FaUserPlus />
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
        <p className="text-[11px] font-bold text-gray-700 text-center">
          We&apos;ll email you a 6-digit code to confirm it&apos;s you. Want to host events? You can apply to become an
          organizer after signing up.
        </p>
      </form>
    </AuthCard>
  );
}
