'use client'

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FaUserCircle, FaSignOutAlt, FaCalendarPlus, FaBell, FaShieldAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onOpenCreateEvent?: () => void;
  activeRole?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenCreateEvent, activeRole }) => {
  const { authState, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/authentication");
  };

  const role = activeRole || authState.user?.userType || "genUser";

  const getRoleLabel = () => {
    switch (role) {
      case "adminUser":
        return { label: "EVENT ADMIN", bg: "bg-[#00F0FF]" };
      case "applicationAdminUser":
        return { label: "SUPER ADMIN", bg: "bg-[#FF007A] text-white" };
      default:
        return { label: "MEMBER", bg: "bg-[#FFE600]" };
    }
  };

  const roleMeta = getRoleLabel();

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b-4 border-black px-6 py-3.5 shadow-[0_4px_0_#000]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Syncronify Logo"
            className="w-10 h-10 border-2 border-black brutal-shadow-sm group-hover:scale-105 transition-transform object-contain bg-white p-1"
          />
          <div className="flex flex-col">
            <span className="font-heading font-black text-xl tracking-tight text-black flex items-center gap-2">
              SYNCRONIFY
            </span>
            <span className="text-[9px] font-black tracking-widest uppercase bg-black text-white px-1.5 py-0.5 w-fit">
              Event Management
            </span>
          </div>
        </Link>

        {/* Quick Nav Links & Role Indicator */}
        <div className="flex items-center gap-4">
          <span className={`brutal-badge ${roleMeta.bg} hidden sm:inline-flex items-center gap-1`}>
            <FaShieldAlt className="text-xs" />
            {roleMeta.label}
          </span>

          {onOpenCreateEvent && (
            <button
              onClick={onOpenCreateEvent}
              className="brutal-btn bg-[#00FF66] px-3.5 py-1.5 text-xs uppercase flex items-center gap-2"
            >
              <FaCalendarPlus />
              <span className="hidden md:inline">New Event</span>
            </button>
          )}

          {authState.isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#F4F4F0] border-2 border-black px-3 py-1 font-bold text-xs brutal-shadow-sm">
                <FaUserCircle className="text-lg text-black" />
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {authState.user?.email.split('@')[0] || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="brutal-btn bg-[#FF007A] text-white p-2 text-xs flex items-center justify-center"
              >
                <FaSignOutAlt className="text-sm" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/authentication"
                className="brutal-btn bg-[#FFE600] px-4 py-1.5 text-xs font-black uppercase"
              >
                Log In / Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;