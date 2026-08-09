"use client";

import EventForm from '@/components/CreateEvent/CreateEvent';
import React, { useState } from 'react'

const adminDashboard = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isCreateActive, setIsCreateActive] = useState(false);

  const handleAddEvent = (event: any) => { 
    // Update the events state with the new event
    setEvents([...events, event]);
  };

  const handleCreateActive = (toggleActive: boolean | ((prevState: boolean) => boolean)) => {
    setIsCreateActive(toggleActive);
  };

  const handleBrowseMap = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsCreateActive(false);
  };

  return (
    <main>
        <h1 className='text-3xl font-bold'>Welcome to the Admin Home!</h1>
        <button className='mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors' onClick={() => handleCreateActive(true)}>
          Create Event
        </button>
        <EventForm isCreateActive={isCreateActive} handleCreateActive={handleCreateActive} handleBrowseMap={handleBrowseMap} />
    </main>
    
    
  )
}

export default adminDashboard;