"use client"

import React, { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import SideBar from '@/components/Sidebar/SideBar';
import CreateEvent from '@/components/CreateEvent/CreateEvent';
import EventPage, { EventItem } from '@/components/EventPage/EventPage';
import Calendar from '@/components/Calendar/Calendar';
import BrowseMap from '@/components/MapBox/BrowseMap';
import NotesManager from '@/components/Notes/NotesManager';
import { LocationProvider } from '@/context/LocationContext';
import { FaCalendarPlus, FaUsers, FaBullhorn, FaCheckCircle, FaTrash, FaEdit, FaShieldAlt, FaPlus } from 'react-icons/fa';

const ADMIN_MANAGED_EVENTS: EventItem[] = [
  {
    id: "org-101",
    title: "⚡ Global Tech Summit 2026",
    category: "Tech & Code",
    description: "Official campus tech conference featuring keynote talks, live demos, and sponsor stalls.",
    date: "2026-09-15",
    time: "10:00 AM - 04:00 PM",
    location: "Main Auditorium",
    organizer: "Computing Council",
    attendeesCount: 248,
    isAttending: true,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "org-102",
    title: "🎨 Neo-Brutalist Design Hackathon",
    category: "Workshop",
    description: "Design sprint hackathon organized for web developers and UI designers across campus.",
    date: "2026-09-20",
    time: "09:00 AM Onwards",
    location: "Innovation Lab",
    organizer: "Computing Council",
    attendeesCount: 174,
    isAttending: true,
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
  },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("events");
  const [isCreateActive, setIsCreateActive] = useState<boolean>(false);
  const [managedEvents, setManagedEvents] = useState<EventItem[]>(ADMIN_MANAGED_EVENTS);
  const [isMapModalActive, setIsMapModalActive] = useState<boolean>(false);

  const handleCreateActive = (active: boolean | ((prev: boolean) => boolean)) => {
    setIsCreateActive(active);
  };

  const handleBrowseMap = (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsMapModalActive(!isMapModalActive);
  };

  const handleDeleteEvent = (id: string) => {
    setManagedEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  return (
    <LocationProvider>
      <div className="min-h-screen bg-[#F4F4F0] text-black font-sans selection:bg-[#FFE600] flex flex-col">
        {/* Top Navbar */}
        <Navbar
          onOpenCreateEvent={() => handleCreateActive(true)}
          activeRole="adminUser"
        />

        {/* Layout */}
        <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
          {/* Sidebar */}
          <SideBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            role="adminUser"
          />

          {/* Main Content Workspace */}
          <main className="flex-1 space-y-6 min-w-0">
            {/* Header Console */}
            <div className="brutal-card bg-[#00F0FF] border-4 border-black p-6 shadow-[8px_8px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-black text-white flex items-center justify-center font-black">
                    <FaShieldAlt />
                  </span>
                  <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-black">
                    Event Organizer Admin Portal
                  </h1>
                </div>
                <p className="text-xs font-bold text-black mt-1">
                  Post official events, track attendance metrics, and control community announcements.
                </p>
              </div>

              <button
                onClick={() => handleCreateActive(true)}
                className="brutal-btn bg-[#FFE600] text-black px-6 py-3 text-xs font-black uppercase flex items-center gap-2"
              >
                <FaCalendarPlus /> Post Official Event
              </button>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="brutal-card bg-white border-2 border-black p-4 text-center">
                <p className="font-heading font-black text-3xl text-black">{managedEvents.length}</p>
                <p className="text-[11px] font-black uppercase text-black mt-1">Active Posted Events</p>
              </div>
              <div className="brutal-card bg-white border-2 border-black p-4 text-center">
                <p className="font-heading font-black text-3xl text-black">422</p>
                <p className="text-[11px] font-black uppercase text-black mt-1">Total RSVP Registrations</p>
              </div>
              <div className="brutal-card bg-white border-2 border-black p-4 text-center">
                <p className="font-heading font-black text-3xl text-black">98.4%</p>
                <p className="text-[11px] font-black uppercase text-black mt-1">Attendance Confirmation Rate</p>
              </div>
            </div>

            {/* Tab Workspace */}
            {activeTab === "events" && (
              <div className="space-y-6">
                {/* Managed Events Table */}
                <div className="brutal-card bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]">
                  <h3 className="font-heading font-black text-xl uppercase text-black border-b-2 border-black pb-3 mb-4">
                    Your Organization Event Listings
                  </h3>

                  <div className="space-y-3">
                    {managedEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="brutal-card bg-[#F4F4F0] border-2 border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="brutal-badge bg-[#FFE600] text-black">
                              {evt.category}
                            </span>
                            <span className="text-[10px] font-bold text-black uppercase">
                              ID: {evt.id}
                            </span>
                          </div>
                          <h4 className="font-heading font-black text-lg text-black">
                            {evt.title}
                          </h4>
                          <p className="text-xs font-bold text-black">
                            📍 {evt.location} • 📅 {evt.date} ({evt.time})
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="brutal-badge bg-[#00FF66] text-black">
                            {evt.attendeesCount} RSVP
                          </span>
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="brutal-btn bg-[#FF007A] text-white p-2 text-xs font-black"
                            title="Delete Event"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <EventPage />
              </div>
            )}

            {activeTab === "calendar" && <Calendar />}
            {activeTab === "notes" && <NotesManager />}
            {activeTab === "map" && (
              <div className="h-[600px]">
                <BrowseMap />
              </div>
            )}
          </main>
        </div>

        {/* Event Form Modal */}
        <CreateEvent
          isCreateActive={isCreateActive}
          handleCreateActive={handleCreateActive}
          handleBrowseMap={handleBrowseMap}
          isAdmin={true}
        />

        {/* Map Modal */}
        {isMapModalActive && (
          <div className="fixed inset-0 z-50 bg-black/80 p-6 flex items-center justify-center">
            <div className="w-full max-w-4xl h-[90vh]">
              <BrowseMap handleBrowseMap={handleBrowseMap} />
            </div>
          </div>
        )}
      </div>
    </LocationProvider>
  );
};

export default AdminDashboard;