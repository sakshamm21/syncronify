"use client"

import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface LoginProps {
  handleClick: () => void;
}

const roleLabels: Record<string, string> = {
  genUser: 'User',
  adminUser: 'Admin',
  applicationAdminUser: 'Application Admin',
};

const roleRedirect: Record<string, string> = {
  genUser: '/dashboard',
  adminUser: '/admin-dashboard',
  applicationAdminUser: '/application-admin-dashboard',
};

function Login({ handleClick }: LoginProps) {
  const { login } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState({
    email: '',
    password: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUser({
      ...user,
      [e.target.id]: e.target.value,
    });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email, password, role } = user;

    if (!email || !password || !role) {
      toast.error('Please fill in all fields and select a role', { position: 'top-right' });
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email, password, userType: role });
      if (response?.status === 'success') {
        toast.success('Login successful! Redirecting...', { position: 'top-right' });
        setTimeout(() => {
          router.push(roleRedirect[role] || '/dashboard');
        }, 1200);
      } else {
        toast.error(response?.message || 'Login failed. Please try again.', { position: 'top-right' });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong. Please try again.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className='flex items-center justify-center w-full'>
        <div className={`mx-auto w-full max-w-md text-slate-800 bg-white rounded-2xl p-10 shadow-2xl shadow-slate-900/20 border border-slate-200`}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold mb-4">
              SF
            </div>
            <h2 className="text-center text-2xl font-bold leading-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Don&apos;t have an account?&nbsp;
              <button
                type="button"
                onClick={handleClick}
                className="font-semibold text-indigo-600 transition-all duration-200 hover:text-indigo-800 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
            <div className='space-y-1.5'>
              <label htmlFor='email' className="inline-block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type='email'
                id='email'
                value={user.email}
                onChange={handleChange}
                className="px-3.5 py-2.5 rounded-lg outline-none duration-200 border border-slate-300 w-full text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                placeholder='you@example.com'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <label htmlFor='password' className="inline-block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type='password'
                id='password'
                value={user.password}
                onChange={handleChange}
                className="px-3.5 py-2.5 rounded-lg outline-none duration-200 border border-slate-300 w-full text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                placeholder='••••••••'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <label htmlFor="role" className="inline-block text-sm font-medium text-slate-700">
                Select Role
              </label>
              <select
                id="role"
                value={user.role}
                onChange={handleChange}
                className="px-3.5 py-2.5 rounded-lg outline-none duration-200 border border-slate-300 w-full text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              >
                <option value="">Select a role</option>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 ${loading ? 'cursor-wait' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  )
}

export default Login
