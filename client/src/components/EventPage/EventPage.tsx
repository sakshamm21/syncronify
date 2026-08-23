'use client'

import React, { useState } from 'react';
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaUserCheck, FaShareAlt, FaTag, FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

export interface EventItem {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendeesCount: number;
  isAttending?: boolean;
  image: string;
}

const PUBLIC_EVENTS: EventItem[] = [
  {
    id: "evt-101",
    title: "Global Tech Summit 2026",
    category: "Tech & Code",
    description: "Join top industry engineers and founders for keynote panels on Agentic AI Systems, distributed infrastructure, and future web frameworks.",
    date: "2026-09-15",
    time: "10:00 AM - 04:00 PM",
    location: "Main Auditorium & Hall A, Campus Center",
    organizer: "Tech & Computing Society",
    attendeesCount: 248,
    isAttending: true,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "evt-102",
    title: "Neo-Brutalist Web Design Hackathon",
    category: "Workshop",
    description: "A fast-paced 24-hour sprint designing high-impact Neo-Brutalist web apps. Free food, stickers, mentorship, and cash prizes for top 3 teams.",
    date: "2026-09-20",
    time: "09:00 AM Onwards",
    location: "Innovation Lab & Creative Hub",
    organizer: "UI/UX & Web Guild",
    attendeesCount: 174,
    isAttending: false,
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "evt-103",
    title: "Annual Cultural Fest & Live Band Night",
    category: "Cultural",
    description: "An evening of music, art installations, food pop-ups, and live acoustic performances under the stars.",
    date: "2026-10-02",
    time: "06:00 PM - 11:00 PM",
    location: "Open Air Amphitheatre",
    organizer: "Cultural Affairs Council",
    attendeesCount: 512,
    isAttending: false,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "evt-104",
    title: "Inter-College E-Sports Championship",
    category: "Sports",
    description: "Competitive Valorant, Rocket League, and EA FC tournament with live casting on Twitch.",
    date: "2026-10-10",
    time: "11:00 AM - 08:00 PM",
    location: "Student Activity Center Gaming Arena",
    organizer: "Games & Sports Council",
    attendeesCount: 320,
    isAttending: false,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
  },
];

const EventPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>(PUBLIC_EVENTS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);

  const toggleRsvp = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const nextState = !e.isAttending;
          return {
            ...e,
            isAttending: nextState,
            attendeesCount: nextState ? e.attendeesCount + 1 : e.attendeesCount - 1,
          };
        }
        return e;
      })
    );

    if (selectedEventModal && selectedEventModal.id === id) {
      const nextState = !selectedEventModal.isAttending;
      setSelectedEventModal({
        ...selectedEventModal,
        isAttending: nextState,
        attendeesCount: nextState ? selectedEventModal.attendeesCount + 1 : selectedEventModal.attendeesCount - 1,
      });
    }
  };

  const categories = ['ALL', 'Tech & Code', 'Workshop', 'Cultural', 'Sports'];

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase()) ||
      evt.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || evt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="brutal-card p-6 bg-[#FFFFFF] border-4 border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-[#FFE600] border-2 border-black flex items-center justify-center font-black">
              ⚡
            </span>
            <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-black">
              Event Hub & Discovery
            </h2>
          </div>
          <p className="text-xs font-bold text-black mt-1">
            Explore official campus & community events, RSVP instantly, and stay in sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="brutal-badge bg-[#00F0FF] text-black">
            {filteredEvents.length} EVENTS AVAILABLE
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3.5 text-black text-xs" />
          <input
            type="text"
            placeholder="Search event title, venue, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-black pl-10 pr-4 py-2.5 font-bold text-xs outline-none brutal-shadow-sm focus:bg-[#FFE600]/10"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`brutal-btn text-[11px] px-3 py-1.5 uppercase ${
                selectedCategory === cat ? 'bg-[#FFE600] text-black' : 'bg-white text-black hover:bg-[#00F0FF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="brutal-card brutal-card-hover bg-white border-4 border-black p-5 flex flex-col justify-between"
          >
            <div>
              {/* Event Image Banner */}
              <div className="relative w-full h-44 border-2 border-black mb-4 overflow-hidden bg-black">
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                />
                <span className="absolute top-2 left-2 brutal-badge bg-[#FFE600] text-black">
                  {evt.category}
                </span>
                {evt.isAttending && (
                  <span className="absolute top-2 right-2 brutal-badge bg-[#00FF66] text-black flex items-center gap-1">
                    <FaCheck /> ATTENDING
                  </span>
                )}
              </div>

              {/* Title & Metadata */}
              <h3 className="font-heading font-black text-xl uppercase tracking-tight text-black mb-2 leading-snug">
                {evt.title}
              </h3>

              <div className="space-y-1.5 text-xs font-bold text-black mb-3">
                <p className="flex items-center gap-2">
                  <FaCalendarAlt className="text-[#FF007A]" />
                  <span>{evt.date} • {evt.time}</span>
                </p>
                <p className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#00F0FF]" />
                  <span className="truncate">{evt.location}</span>
                </p>
                <p className="flex items-center gap-2 text-[11px] text-gray-700">
                  <FaUsers className="text-black" />
                  <span>Hosted by <strong>{evt.organizer}</strong> ({evt.attendeesCount} Attending)</span>
                </p>
              </div>

              <p className="text-xs font-medium text-black line-clamp-2 leading-relaxed mb-4">
                {evt.description}
              </p>
            </div>

            {/* Action Footer */}
            <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedEventModal(evt)}
                className="brutal-btn bg-[#F4F4F0] text-black px-3.5 py-2 text-xs uppercase"
              >
                View Details
              </button>

              <button
                onClick={() => toggleRsvp(evt.id)}
                className={`brutal-btn px-4 py-2 text-xs uppercase font-black flex items-center gap-1.5 ${
                  evt.isAttending
                    ? 'bg-[#00FF66] text-black'
                    : 'bg-[#FFE600] text-black hover:bg-[#00F0FF]'
                }`}
              >
                {evt.isAttending ? (
                  <>
                    <FaUserCheck /> Attending
                  </>
                ) : (
                  <>
                    + RSVP Event
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="brutal-card w-full max-w-xl bg-white border-4 border-black p-6 shadow-[10px_10px_0px_#000] relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-4 border-black pb-3 mb-4">
              <span className="brutal-badge bg-[#FFE600] text-black">
                {selectedEventModal.category}
              </span>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="brutal-btn bg-[#FF007A] text-white p-1 text-xs"
              >
                <FaTimes />
              </button>
            </div>

            <img
              src={selectedEventModal.image}
              alt={selectedEventModal.title}
              className="w-full h-52 object-cover border-2 border-black mb-4 brutal-shadow-sm"
            />

            <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-black mb-2">
              {selectedEventModal.title}
            </h2>

            <div className="bg-[#F4F4F0] border-2 border-black p-3 space-y-1.5 text-xs font-bold text-black mb-4">
              <p>📅 <strong>Date & Time:</strong> {selectedEventModal.date} ({selectedEventModal.time})</p>
              <p>📍 <strong>Venue Location:</strong> {selectedEventModal.location}</p>
              <p>👥 <strong>Organizer:</strong> {selectedEventModal.organizer}</p>
              <p>🎟️ <strong>Confirmed Attendees:</strong> {selectedEventModal.attendeesCount} Members</p>
            </div>

            <p className="text-xs font-medium text-black leading-relaxed mb-6">
              {selectedEventModal.description}
            </p>

            <div className="pt-4 border-t-4 border-black flex items-center justify-between">
              <button
                onClick={() => alert(`Share link copied for ${selectedEventModal.title}`)}
                className="brutal-btn bg-white text-black px-4 py-2 text-xs uppercase flex items-center gap-1.5"
              >
                <FaShareAlt /> Share Event
              </button>

              <button
                onClick={() => toggleRsvp(selectedEventModal.id)}
                className={`brutal-btn px-6 py-2.5 text-xs uppercase font-black flex items-center gap-2 ${
                  selectedEventModal.isAttending
                    ? 'bg-[#00FF66] text-black'
                    : 'bg-[#FFE600] text-black'
                }`}
              >
                {selectedEventModal.isAttending ? <FaUserCheck /> : null}
                {selectedEventModal.isAttending ? 'Attending Event' : 'RSVP Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPage;
