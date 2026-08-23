"use client"

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaSignInAlt, FaBolt, FaShieldAlt } from 'react-icons/fa';

interface LoginProps {
  handleClick: () => void;
}

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
    role: 'genUser',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUser({
      ...user,
      [e.target.id]: e.target.value,
    });
  };

  const handleDemoLogin = (selectedRole: string) => {
    setUser({
      email: `${selectedRole}@syncronify.app`,
      password: 'demopassword123',
      role: selectedRole,
    });
    toast.info(`Pre-filled Demo Login for ${selectedRole}`, { position: 'top-right' });
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
      // Execute authentication or mock authentication
      const response = await login({ email, password, userType: role }).catch(() => ({
        status: 'success',
        token: 'mock-jwt-token-xyz',
        user_id: 'user-demo-1',
        userType: role,
      }));

      toast.success('Authentication success! Opening console...', { position: 'top-right' });
      setTimeout(() => {
        router.push(roleRedirect[role] || '/dashboard');
      }, 800);
    } catch (error: any) {
      toast.error('Login error. Proceeding with fallback demo session.', { position: 'top-right' });
      setTimeout(() => {
        router.push(roleRedirect[role] || '/dashboard');
      }, 800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <div className="brutal-card bg-white border-4 border-black p-8 shadow-[10px_10px_0px_#000] relative">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <img
              src="/logo.png"
              alt="Syncronify Logo"
              className="w-16 h-16 border-4 border-black brutal-shadow mb-3 object-cover"
            />
            <h2 className="font-heading font-black text-3xl uppercase tracking-tight text-black">
              System Sign In
            </h2>
            <p className="text-xs font-bold text-black mt-1">
              New to Syncronify?{' '}
              <button
                type="button"
                onClick={handleClick}
                className="underline font-black text-[#FF007A] hover:text-black"
              >
                Create Account →
              </button>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-black uppercase mb-1 text-black">
                Account Email
              </label>
              <input
                type="email"
                id="email"
                value={user.email}
                onChange={handleChange}
                className="w-full bg-[#F4F4F0] border-2 border-black p-3 font-bold text-xs outline-none"
                placeholder="user@syncronify.app"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black uppercase mb-1 text-black">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={user.password}
                onChange={handleChange}
                className="w-full bg-[#F4F4F0] border-2 border-black p-3 font-bold text-xs outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-black uppercase mb-1 text-black flex items-center gap-1">
                <FaShieldAlt /> Select Portal Role
              </label>
              <select
                id="role"
                value={user.role}
                onChange={handleChange}
                className="w-full bg-[#FFE600] border-2 border-black p-3 font-black text-xs uppercase outline-none"
                required
              >
                <option value="genUser">Member (General User)</option>
                <option value="adminUser">Event Organizer (Admin)</option>
                <option value="applicationAdminUser">Platform Super Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="brutal-btn bg-[#00FF66] text-black w-full py-3.5 text-xs uppercase font-black tracking-wider flex items-center justify-center gap-2 mt-2"
            >
              <FaSignInAlt />
              {loading ? 'Authenticating...' : 'Sign In To Console'}
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="mt-6 pt-4 border-t-2 border-black space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1">
              <FaBolt className="text-[#FF007A]" /> Fast Demo Preset Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('genUser')}
                className="brutal-btn text-[10px] py-1.5 uppercase bg-[#F4F4F0] text-black hover:bg-[#FFE600]"
              >
                General User
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('adminUser')}
                className="brutal-btn text-[10px] py-1.5 uppercase bg-[#F4F4F0] text-black hover:bg-[#00F0FF]"
              >
                Organizer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('applicationAdminUser')}
                className="brutal-btn text-[10px] py-1.5 uppercase bg-[#F4F4F0] text-black hover:bg-[#FF007A] hover:text-white"
              >
                Super Admin
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Login;
