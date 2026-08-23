"use client"

import React from 'react';
import EventDetail from "@/components/adminEvent/EventDetail";

export const dynamic = 'force-dynamic';

interface EventDetailPageProps {
  params: { eventId: string };
}

const EventDetailPage = ({ params }: EventDetailPageProps) => {
  const { eventId } = params;

  return (
    <div className="p-6 bg-[#F4F4F0] min-h-screen">
      <EventDetail eventId={eventId || "1"} />
    </div>
  );
};

export default EventDetailPage;
