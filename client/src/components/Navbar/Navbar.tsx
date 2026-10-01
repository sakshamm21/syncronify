'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaSignOutAlt, FaCalendarPlus, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { ROLE_HOME, ROLE_LABELS } from '@/lib/format';
import NotificationBell from './NotificationBell';

interface NavbarProps {
  onOpenCreateEvent?: () => void;
}

const ROLE_BADGE_CLASS = {
  member: 'bg-[#FFE600]',
  organizer: 'bg-[#00F0FF]',
  admin: 'bg-[#FF007A] text-white',
} as const;

const Navbar: React.FC<NavbarProps> = ({ onOpenCreateEvent }) => {
  const { user, status, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/authentication');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b-4 border-black px-6 py-3.5 shadow-[0_4px_0_#000]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link href={user ? ROLE_HOME[user.role] : '/'} className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Syncronify Logo"
            className="w-10 h-10 border-2 border-black brutal-shadow-sm group-hover:rotate-6 transition-transform object-cover"
          />
          <div className="flex flex-col">
            <span className="font-heading font-black text-xl tracking-tight text-black">SYNCRONIFY</span>
            <span className="text-[9px] font-black tracking-widest uppercase bg-black text-white px-1.5 py-0.5 w-fit">
              Event Management
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <span className={`brutal-badge ${ROLE_BADGE_CLASS[user.role]} hidden sm:inline-flex items-center gap-1`}>
              <FaShieldAlt className="text-xs" />
              {ROLE_LABELS[user.role].toUpperCase()}
            </span>
          )}

          {user && onOpenCreateEvent && (
            <button
              onClick={onOpenCreateEvent}
              className="brutal-btn bg-[#00FF66] px-3.5 py-1.5 text-xs uppercase flex items-center gap-2"
            >
              <FaCalendarPlus />
              <span className="hidden md:inline">New Event</span>
            </button>
          )}

          {user ? (
            <>
              <NotificationBell />
              <div className="flex items-center gap-2 bg-[#F4F4F0] border-2 border-black px-3 py-1 font-bold text-xs brutal-shadow-sm">
                <FaUserCircle className="text-lg text-black" />
                <span className="hidden sm:inline truncate max-w-[140px]">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="brutal-btn bg-[#FF007A] text-white p-2 text-xs flex items-center justify-center"
              >
                <FaSignOutAlt className="text-sm" />
              </button>
            </>
          ) : (
            status === 'anonymous' && (
              <Link href="/authentication" className="brutal-btn bg-[#FFE600] px-4 py-1.5 text-xs font-black uppercase">
                Log In / Register
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
