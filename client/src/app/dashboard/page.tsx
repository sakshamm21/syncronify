'use client';

import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import Navbar from '@/components/Navbar/Navbar';
import SideBar from '@/components/Sidebar/Sidebar';
import RecommendedCarousel from '@/components/Carousel/Carousel';
import EventPage from '@/components/EventPage/EventPage';
import UpNext from '@/components/EventPage/UpNext';
import Calendar from '@/components/Calendar/Calendar';
import NotesManager from '@/components/Notes/NotesManager';
import ChatInterface from '@/components/Chat/ChatInterface';
import ChatButton from '@/components/Chat/ChatButton';
import CreateEvent from '@/components/CreateEvent/CreateEvent';
import VenueMap from '@/components/VenueMap/VenueMap';
import ProfilePanel from '@/components/Profile/ProfilePanel';
import { useAuth } from '@/context/AuthContext';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('events');
  const [isCreateActive, setIsCreateActive] = useState(false);
  const [createDate, setCreateDate] = useState<Date | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openCreate = (date: Date | null = null) => {
    setCreateDate(date);
    setIsCreateActive(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans selection:bg-[#FFE600] flex flex-col">
      <Navbar onOpenCreateEvent={() => openCreate()} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 space-y-6 min-w-0">
          <div className="brutal-card bg-white border-4 border-black p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-heading font-black text-xl uppercase">Hi, {user?.name.split(' ')[0]} 👋</p>
              <p className="text-xs font-bold">Find something to do, or plan your own.</p>
            </div>
            <button
              onClick={() => openCreate()}
              className="brutal-btn bg-[#00FF66] text-black px-4 py-2 text-xs uppercase font-black flex items-center gap-1.5"
            >
              <FaPlus /> {user?.role === 'member' ? 'Add Personal Event' : 'Create Event'}
            </button>
          </div>

          {activeTab === 'events' && (
            <div className="space-y-6">
              <UpNext />
              <RecommendedCarousel />
              <EventPage />
            </div>
          )}
          {activeTab === 'calendar' && <Calendar onSelectDate={(date) => openCreate(date)} />}
          {activeTab === 'notes' && <NotesManager />}
          {activeTab === 'map' && (
            <div className="h-[650px] w-full">
              <VenueMap />
            </div>
          )}
          {activeTab === 'chat' && <ChatInterface inline />}
          {activeTab === 'profile' && <ProfilePanel />}
        </main>
      </div>

      <CreateEvent
        isCreateActive={isCreateActive}
        handleCreateActive={setIsCreateActive}
        initialDate={createDate}
      />

      {activeTab !== 'chat' && (
        <>
          <ChatButton onClick={() => setIsChatOpen((open) => !open)} isOpen={isChatOpen} />
          {isChatOpen && <ChatInterface onClose={() => setIsChatOpen(false)} />}
        </>
      )}
    </div>
  );
}
