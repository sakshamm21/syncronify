"use client"

import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UserRegisterProps {
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

function UserRegister({ handleClick }: UserRegisterProps) {

    const router = useRouter();

    const { register, verifyOtp, resendOtp } = useAuth();

    const [newUser, setNewUser] = useState({
        userName: '',
        email: '',
        password: '',
        userType: '',
    });
    const [sentOtp, setSentOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [timer, setTimer] = useState<number>(30);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>({
        userId: "",
        userType: ""
    });
    const [devOtp, setDevOtp] = useState<string>('');

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);

            return () => clearInterval(interval);
        } else {
            setIsTimeUp(true);
        }
    }, [timer]);


    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    }


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { userName, email, password, userType } = newUser;

        if (!userName || !email || !password || !userType) {
            toast.error('Please fill in all fields and select a role', { position: 'top-right' });
            return;
        }
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long', { position: 'top-right' });
            return;
        }

        setLoading(true);
        try {
            const response = await register(newUser);
            if (response?.status === 'success') {
                setUser({ userId: response.user.userId, userType: response.user.userType });
                // Dev fallback: when SMTP isn't configured, the server returns the OTP
                // in `devOtp` so the user can complete sign-up without an email.
                if (response.devOtp) {
                    setDevOtp(response.devOtp);
                    setOtp(response.devOtp);
                }
                setSentOtp(true);
                setTimer(30);
                toast.success('OTP sent! Check your email inbox.', { position: 'top-right' });
            } else {
                toast.error(response?.message || 'Registration failed', { position: 'top-right' });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Something went wrong. Please try again.', { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOtp = async (event: any) => {
        event.preventDefault();
        if (!otp) {
            toast.error('Please enter the OTP', { position: 'top-right' });
            return;
        }
        const { email, userType } = newUser;
        try {
            const response = await verifyOtp({ email, otp, userType });
            if (response?.status === 'success') {
                toast.success('Email verified successfully!', { position: 'top-right' });
                setTimeout(() => {
                    router.push(roleRedirect[userType] || '/dashboard');
                }, 1500);
            } else {
                toast.error(response?.message || 'Wrong OTP. Please try again.', { position: 'top-right' });
                setOtp('');
            }
        } catch (err: any) {
            toast.error(err?.message || 'OTP verification failed', { position: 'top-right' });
        }
    };

    const handleResendOtp = async (event: any) => {
        event?.preventDefault();
        const { userId, userType } = user;
        if (!userId || !userType) return;
        try {
            const response = await resendOtp({ userId, userType });
            if (response?.status === 'success') {
                if (response.devOtp) {
                    setDevOtp(response.devOtp);
                    setOtp(response.devOtp);
                }
                toast.success('OTP resent! Check your email.', { position: 'top-right' });
                setTimer(30);
                setIsTimeUp(false);
            } else {
                toast.error(response?.message || 'Failed to resend OTP', { position: 'top-right' });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to resend OTP', { position: 'top-right' });
        }
    }

    const inputClass = "px-3.5 py-2.5 rounded-lg outline-none duration-200 border border-slate-300 w-full text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400";

    return (
        <>
            <div className="flex items-center justify-center w-full">
                <div className={`mx-auto w-full max-w-md text-slate-800 bg-white rounded-2xl p-10 shadow-2xl shadow-slate-900/20 border border-slate-200`}>
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold mb-4">
                            SF
                        </div>
                        <h2 className="text-center text-2xl font-bold leading-tight text-slate-900">
                            {sentOtp ? 'Verify your email' : 'Create your account'}
                        </h2>
                        <p className="mt-2 text-center text-sm text-slate-500">
                            Already have an account?&nbsp;
                            <button
                                type="button"
                                onClick={handleClick}
                                className="font-semibold text-indigo-600 transition-all duration-200 hover:text-indigo-800 hover:underline"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>

                    {!sentOtp && <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
                        <div className='space-y-1.5'>
                            <label htmlFor='userName' className="inline-block text-sm font-medium text-slate-700">Username</label>
                            <input
                                type='text'
                                id='userName'
                                name='userName'
                                value={newUser.userName}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder='johndoe'
                                required
                            />
                        </div>

                        <div className='space-y-1.5'>
                            <label htmlFor='email' className="inline-block text-sm font-medium text-slate-700">Email</label>
                            <input
                                type='email'
                                id='email'
                                name='email'
                                value={newUser.email}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder='you@example.com'
                                required
                            />
                        </div>

                        <div className='space-y-1.5'>
                            <label htmlFor='password' className="inline-block text-sm font-medium text-slate-700">Password</label>
                            <input
                                type='password'
                                id='password'
                                name='password'
                                value={newUser.password}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder='At least 8 characters'
                                required
                            />
                        </div>

                        <div className='space-y-1.5'>
                            <label htmlFor="userType" className="inline-block text-sm font-medium text-slate-700">Select Role</label>
                            <select id="userType" name='userType' value={newUser.userType} onChange={handleChange} className={inputClass} required>
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
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>}

                    {sentOtp &&
                        <form onSubmit={handleSubmitOtp} className='mt-4 space-y-4'>
                            <div className='space-y-1.5 flex flex-col'>
                                <label htmlFor="otp" className="inline-block text-sm font-medium text-slate-700">OTP</label>
                                <input
                                    type="text"
                                    name="otp"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className={inputClass}
                                    placeholder='Enter the 6-digit OTP'
                                    maxLength={6}
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1">A 6-digit code was sent to {newUser.email}</p>
                                {devOtp && (
                                    <div className="mt-2 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 p-3 text-center">
                                        <p className="text-xs font-medium text-indigo-500">Development mode — OTP</p>
                                        <p className="mt-1 text-2xl font-bold tracking-[0.4em] text-indigo-700">{devOtp}</p>
                                        <p className="mt-1 text-[11px] text-slate-400">(No email was sent because SMTP isn't configured)</p>
                                    </div>
                                )}
                                <div className="ml-auto">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={!isTimeUp}
                                        className={`bg-transparent text-sm font-medium ${isTimeUp ? 'text-indigo-600 hover:underline' : 'text-slate-400 cursor-not-allowed'}`}
                                    >
                                        {isTimeUp ? 'Resend OTP' : `Resend in ${timer}s`}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                            >
                                Verify
                            </button>
                        </form>
                    }
                </div>
            </div>
            <ToastContainer />
        </>
    )
}

export default UserRegister

