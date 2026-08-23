'use client'

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCalendarAlt, FaLayerGroup, FaMapMarkedAlt, FaStickyNote, FaComments, FaUserShield, FaHome } from "react-icons/fa";

interface SidebarItem {
  id: string;
  name: string;
  icon: JSX.Element;
  badge?: string;
  href?: string;
}

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  role?: string;
}

const SideBar: React.FC<SidebarProps> = ({ activeTab = "events", setActiveTab, role = "genUser" }) => {
  const pathname = usePathname();

  const navItems: SidebarItem[] = [
    { id: "events", name: "Events Hub", icon: <FaLayerGroup /> },
    { id: "calendar", name: "Schedule", icon: <FaCalendarAlt /> },
    { id: "notes", name: "Notes & Ideas", icon: <FaStickyNote />, badge: "NEW" },
    { id: "map", name: "Venue Map", icon: <FaMapMarkedAlt /> },
    { id: "chat", name: "Live Chat", icon: <FaComments /> },
  ];

  if (role === "adminUser") {
    navItems.push({ id: "admin", name: "Admin Dashboard", icon: <FaUserShield />, href: "/admin-dashboard" });
  } else if (role === "applicationAdminUser") {
    navItems.push({ id: "superadmin", name: "Super Admin", icon: <FaUserShield />, href: "/application-admin-dashboard" });
  }

  return (
    <aside className="w-full md:w-64 bg-[#FFFFFF] border-b-4 md:border-b-0 md:border-r-4 border-black p-4 flex flex-col justify-between shrink-0 shadow-[4px_0_0_#000]">
      <div>
        {/* Navigation Header */}
        <div className="mb-6 pb-3 border-b-2 border-black flex items-center justify-between">
          <span className="font-heading font-black text-xs uppercase tracking-wider bg-black text-white px-2 py-1">
            Navigation Console
          </span>
          <Link href="/" className="text-xs font-bold underline hover:text-[#FF007A] flex items-center gap-1">
            <FaHome /> Home
          </Link>
        </div>

        {/* Tab Items */}
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {navItems.map((item) => {
            const isTabActive = activeTab === item.id;
            
            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`brutal-btn w-full text-left px-4 py-3 text-xs uppercase font-extrabold flex items-center justify-between gap-3 ${
                    pathname === item.href ? "bg-[#FF007A] text-white" : "bg-[#F4F4F0] text-black hover:bg-[#FFE600]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab && setActiveTab(item.id)}
                className={`brutal-btn w-full text-left px-4 py-3 text-xs uppercase font-extrabold flex items-center justify-between gap-3 whitespace-nowrap md:whitespace-normal ${
                  isTabActive
                    ? "bg-[#FFE600] text-black"
                    : "bg-[#FFFFFF] text-black hover:bg-[#00F0FF]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#FF007A] text-white text-[9px] font-black px-1.5 py-0.5 border border-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="hidden md:block mt-8 p-3 bg-[#FFE600] border-2 border-black brutal-shadow-sm">
        <p className="text-[11px] font-extrabold uppercase tracking-tight text-black">
          ⚡ Syncronify v1.0
        </p>
        <p className="text-[10px] font-semibold text-black mt-1">
          Neo-Brutalist Event OS initialized. System ready.
        </p>
      </div>
    </aside>
  );
};

export default SideBar;