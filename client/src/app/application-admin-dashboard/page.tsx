"use client"

import React, { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import SideBar from '@/components/Sidebar/SideBar';
import { FaShieldAlt, FaUserCheck, FaUserTimes, FaBuilding, FaServer, FaCheckCircle, FaExclamationTriangle, FaSearch } from 'react-icons/fa';

interface AdminAccount {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  community: string;
  members: number;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@iitk.ac.in",
    phone: "+91-9876543210",
    role: "Community Leader",
    community: "Computing & Tech Society",
    members: 1250,
    status: 'ACTIVE',
  },
  {
    id: 2,
    name: "Alice Smith",
    email: "alice.smith@iitk.ac.in",
    phone: "+91-9876543211",
    role: "Community Coordinator",
    community: "Cultural Affairs Council",
    members: 1800,
    status: 'ACTIVE',
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.j@iitk.ac.in",
    phone: "+91-9876543212",
    role: "Event Director",
    community: "Games & Sports Council",
    members: 950,
    status: 'PENDING',
  },
  {
    id: 4,
    name: "Emily Wilson",
    email: "emily.w@iitk.ac.in",
    phone: "+91-9876543213",
    role: "Moderator",
    community: "Design & Media Club",
    members: 640,
    status: 'ACTIVE',
  },
];

const AppAdminDashboard: React.FC = () => {
  const [admins, setAdmins] = useState<AdminAccount[]>(INITIAL_ADMINS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>("superadmin");

  const toggleStatus = (id: number) => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.community.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans selection:bg-[#FFE600] flex flex-col">
      {/* Top Navbar */}
      <Navbar activeRole="applicationAdminUser" />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Sidebar */}
        <SideBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          role="applicationAdminUser"
        />

        {/* Content Workspace */}
        <main className="flex-1 space-y-6 min-w-0">
          {/* Header Console */}
          <div className="brutal-card bg-[#FF007A] text-white border-4 border-black p-6 shadow-[8px_8px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-[#FFE600] flex items-center justify-center font-black">
                  ⚡
                </span>
                <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-white">
                  Super Admin Governance Console
                </h1>
              </div>
              <p className="text-xs font-bold text-white mt-1">
                System-wide management of organization admins, community access, and infrastructure health metrics.
              </p>
            </div>

            <span className="brutal-badge bg-[#FFE600] text-black text-xs font-black">
              SUPERADMIN PRIVILEGE
            </span>
          </div>

          {/* System Health Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="brutal-card bg-white border-2 border-black p-4 text-center">
              <span className="text-[10px] font-black uppercase text-black bg-[#00FF66] px-1.5 py-0.5 border border-black inline-block mb-1">
                ONLINE
              </span>
              <p className="font-heading font-black text-xl text-black">Express HTTP API</p>
              <p className="text-[10px] font-bold text-black">Port 8000 / Healthy</p>
            </div>

            <div className="brutal-card bg-white border-2 border-black p-4 text-center">
              <span className="text-[10px] font-black uppercase text-black bg-[#00FF66] px-1.5 py-0.5 border border-black inline-block mb-1">
                ONLINE
              </span>
              <p className="font-heading font-black text-xl text-black">Socket.io Service</p>
              <p className="text-[10px] font-bold text-black">Low-Latency WebSockets</p>
            </div>

            <div className="brutal-card bg-white border-2 border-black p-4 text-center">
              <span className="text-[10px] font-black uppercase text-black bg-[#FFE600] px-1.5 py-0.5 border border-black inline-block mb-1">
                READY
              </span>
              <p className="font-heading font-black text-xl text-black">MongoDB / Mongoose</p>
              <p className="text-[10px] font-bold text-black">Persistent DB Layer</p>
            </div>

            <div className="brutal-card bg-white border-2 border-black p-4 text-center">
              <span className="text-[10px] font-black uppercase text-black bg-[#00F0FF] px-1.5 py-0.5 border border-black inline-block mb-1">
                COMMUNITIES
              </span>
              <p className="font-heading font-black text-xl text-black">{admins.length} Managed</p>
              <p className="text-[10px] font-bold text-black">4,640 Total Members</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-3.5 text-black text-xs" />
            <input
              type="text"
              placeholder="Search admin name, community, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-black pl-10 pr-4 py-2.5 font-bold text-xs outline-none brutal-shadow-sm"
            />
          </div>

          {/* Admin Directory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAdmins.map((admin) => (
              <div
                key={admin.id}
                className="brutal-card brutal-card-hover bg-white border-4 border-black p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-[#FFE600] border-2 border-black flex items-center justify-center font-black text-sm">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-lg text-black leading-snug">
                          {admin.name}
                        </h3>
                        <p className="text-[11px] font-bold text-gray-700">{admin.role}</p>
                      </div>
                    </div>

                    <span
                      className={`brutal-badge ${
                        admin.status === 'ACTIVE'
                          ? 'bg-[#00FF66] text-black'
                          : admin.status === 'PENDING'
                          ? 'bg-[#FFE600] text-black'
                          : 'bg-[#FF007A] text-white'
                      }`}
                    >
                      {admin.status}
                    </span>
                  </div>

                  <div className="bg-[#F4F4F0] border-2 border-black p-3 space-y-1 text-xs font-bold text-black mb-4">
                    <p className="flex items-center justify-between">
                      <span>🏛️ <strong>Community:</strong></span>
                      <span>{admin.community}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>👥 <strong>Members:</strong></span>
                      <span>{admin.members}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>✉️ <strong>Email:</strong></span>
                      <span className="font-mono text-[11px]">{admin.email}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2">
                  <button
                    onClick={() => alert(`View details for ${admin.name}`)}
                    className="brutal-btn bg-white text-black px-3.5 py-1.5 text-xs font-bold uppercase"
                  >
                    View Logs
                  </button>

                  <button
                    onClick={() => toggleStatus(admin.id)}
                    className={`brutal-btn px-4 py-1.5 text-xs font-black uppercase ${
                      admin.status === 'ACTIVE'
                        ? 'bg-[#FF007A] text-white'
                        : 'bg-[#00FF66] text-black'
                    }`}
                  >
                    {admin.status === 'ACTIVE' ? 'Suspend Admin' : 'Approve Admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppAdminDashboard;
