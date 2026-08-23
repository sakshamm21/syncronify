"use client"

import React, { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import SideBar from '@/components/Sidebar/Sidebar';
import LocalCarousel from '@/components/Carousel/Carousel';
import EventPage from '@/components/EventPage/EventPage';
import Calendar from '@/components/Calendar/Calendar';
import NotesManager from '@/components/Notes/NotesManager';
import BrowseMap from '@/components/MapBox/BrowseMap';
import ChatInterface from '@/components/Chat/ChatInterface';
import ChatButton from '@/components/Chat/ChatButton';
import CreateEvent from '@/components/CreateEvent/CreateEvent';
import { LocationProvider } from '@/context/LocationContext';
import { FaPlus, FaLayerGroup, FaCalendarAlt, FaStickyNote, FaMapMarkedAlt, FaComments } from 'react-icons/fa';

const GeneralDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("events");
  const [isCreateActive, setIsCreateActive] = useState<boolean>(false);
  const [isMapModalActive, setIsMapModalActive] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const handleCreateActive = (active: boolean | ((prev: boolean) => boolean)) => {
    setIsCreateActive(active);
  };

  const handleBrowseMap = (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsMapModalActive(!isMapModalActive);
  };

  return (
    <LocationProvider>
      <div className="min-h-screen bg-[#F4F4F0] text-black font-sans selection:bg-[#FFE600] flex flex-col">
        {/* Navbar */}
        <Navbar
          onOpenCreateEvent={() => handleCreateActive(true)}
          activeRole="genUser"
        />

        {/* Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
          {/* Left Sidebar Console */}
          <SideBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            role="genUser"
          />

          {/* Main Content Workspace */}
          <main className="flex-1 space-y-6 min-w-0">
            {/* Quick Action Top Bar */}
            <div className="brutal-card bg-white border-4 border-black p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="brutal-badge bg-[#FFE600] text-black font-black uppercase">
                  MEMBER DASHBOARD
                </span>
                <span className="text-xs font-bold text-black hidden sm:inline">
                  • System Active
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCreateActive(true)}
                  className="brutal-btn bg-[#00FF66] text-black px-4 py-2 text-xs uppercase font-black flex items-center gap-1.5"
                >
                  <FaPlus /> Create Personal Event
                </button>
              </div>
            </div>

            {/* Dynamic Tab Switcher Content */}
            {activeTab === "events" && (
              <div className="space-y-6">
                <LocalCarousel />
                <EventPage />
              </div>
            )}

            {activeTab === "calendar" && (
              <div className="space-y-6">
                <Calendar />
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-6">
                <NotesManager />
              </div>
            )}

            {activeTab === "map" && (
              <div className="h-[650px] w-full">
                <BrowseMap />
              </div>
            )}

            {activeTab === "chat" && (
              <div className="w-full">
                <ChatInterface inline={true} />
              </div>
            )}
          </main>
        </div>

        {/* Modal: Create Event */}
        <CreateEvent
          isCreateActive={isCreateActive}
          handleCreateActive={handleCreateActive}
          handleBrowseMap={handleBrowseMap}
          isAdmin={false}
        />

        {/* Modal: Browse Map selector popup if triggered inside create event */}
        {isMapModalActive && (
          <div className="fixed inset-0 z-50 bg-black/80 p-6 flex items-center justify-center">
            <div className="w-full max-w-4xl h-[90vh]">
              <BrowseMap handleBrowseMap={handleBrowseMap} />
            </div>
          </div>
        )}

        {/* Floating Chat Trigger & Drawer */}
        <ChatButton onClick={() => setIsChatOpen(!isChatOpen)} isOpen={isChatOpen} />
        {isChatOpen && (
          <ChatInterface onClose={() => setIsChatOpen(false)} inline={false} />
        )}
      </div>
    </LocationProvider>
  );
};

export default GeneralDashboard;