"use client"

import React from 'react';
import EventDetailPage from "@/components/EventPage/EventDetailPage";

export const dynamic = 'force-dynamic';

interface EventDetailPageProps {
  params: { eventId: string };
}

const EventDetailPageContainer = ({ params }: EventDetailPageProps) => {
  const { eventId } = params;

  const mockEvent = {
    id: eventId,
    event: {
      community_photo: "/logo.png",
      community_name: "Computing Council",
      event_photo: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
      event_title: "Tech Summit 2026",
    },
    description: {
      date: "15/09/2026",
      time: "10:00 AM",
      about: "Official campus tech conference featuring keynote panels on Agentic AI Systems, distributed infrastructure, and future web frameworks.",
      place: "Main Auditorium",
    },
    admin: {
      photo: "/logo.png",
      name: "Tech & Computing Society",
      email: "contact@syncronify.app",
      info: "IIT Kanpur Campus Council",
    },
  };

  return (
    <div className="p-6 bg-[#F4F4F0] min-h-screen">
      <EventDetailPage eventData={mockEvent} />
    </div>
  );
};

export default EventDetailPageContainer;
