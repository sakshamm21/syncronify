'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaCalendarAlt,
  FaLayerGroup,
  FaMapMarkedAlt,
  FaStickyNote,
  FaComments,
  FaUserShield,
  FaUserCog,
  FaHome,
  FaBullhorn,
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export interface SidebarTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export const MEMBER_TABS: SidebarTab[] = [
  { id: 'events', name: 'Events Hub', icon: <FaLayerGroup /> },
  { id: 'calendar', name: 'My Schedule', icon: <FaCalendarAlt /> },
  { id: 'notes', name: 'Notes & Ideas', icon: <FaStickyNote /> },
  { id: 'map', name: 'Venue Map', icon: <FaMapMarkedAlt /> },
  { id: 'chat', name: 'Event Chat', icon: <FaComments /> },
  { id: 'profile', name: 'Profile', icon: <FaUserCog /> },
];

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  tabs?: SidebarTab[];
}

const SideBar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, tabs = MEMBER_TABS }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  // Workspaces this user can switch between.
  const links = [
    { href: '/dashboard', name: 'My Workspace', icon: <FaHome /> },
    ...(user?.role === 'organizer' || user?.role === 'admin'
      ? [{ href: '/admin-dashboard', name: 'Organizer Console', icon: <FaBullhorn /> }]
      : []),
    ...(user?.role === 'admin' ? [{ href: '/application-admin-dashboard', name: 'Super Admin', icon: <FaUserShield /> }] : []),
  ].filter((link) => link.href !== pathname);

  return (
    <aside className="w-full md:w-64 bg-[#FFFFFF] border-b-4 md:border-b-0 md:border-r-4 border-black p-4 flex flex-col justify-between shrink-0 shadow-[4px_0_0_#000]">
      <div>
        <div className="mb-6 pb-3 border-b-2 border-black">
          <span className="font-heading font-black text-xs uppercase tracking-wider bg-black text-white px-2 py-1">
            Navigation
          </span>
        </div>

        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab?.(item.id)}
              aria-current={activeTab === item.id ? 'page' : undefined}
              className={`brutal-btn w-full text-left px-4 py-3 text-xs uppercase font-extrabold flex items-center gap-2.5 whitespace-nowrap md:whitespace-normal ${
                activeTab === item.id ? 'bg-[#FFE600] text-black' : 'bg-[#FFFFFF] text-black hover:bg-[#00F0FF]'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}

          {links.length > 0 && <div className="hidden md:block border-t-2 border-black my-2" />}
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="brutal-btn w-full text-left px-4 py-3 text-xs uppercase font-extrabold flex items-center gap-2.5 whitespace-nowrap bg-[#F4F4F0] text-black hover:bg-[#FF007A] hover:text-white"
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="hidden md:block mt-8 p-3 bg-[#FFE600] border-2 border-black brutal-shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-tight text-black">Syncronify Platform</p>
        <p className="text-[10px] font-bold text-black mt-1">Unified Event & Team Console</p>
      </div>
    </aside>
  );
};

export default SideBar;
