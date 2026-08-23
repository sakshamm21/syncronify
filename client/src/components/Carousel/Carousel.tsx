'use client'

import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaFire, FaMapMarkerAlt } from 'react-icons/fa';

const HIGHLIGHT_EVENTS = [
  {
    id: "h1",
    title: "⚡ Global Tech Summit 2026",
    tag: "FEATURED",
    date: "SEP 15, 2026",
    location: "Main Auditorium",
    desc: "Keynote panels on Agentic AI, high-frequency systems & engineering design.",
    color: "bg-[#FFE600]",
  },
  {
    id: "h2",
    title: "🎨 Neo-Brutalist Design Hackathon",
    tag: "POPULAR",
    date: "SEP 20, 2026",
    location: "Innovation Hub",
    desc: "24-hour sprint build challenge for UI/UX creators with $5,000 in cash prizes.",
    color: "bg-[#00F0FF]",
  },
  {
    id: "h3",
    title: "🎸 Campus Music & Live Fest",
    tag: "HOT",
    date: "OCT 02, 2026",
    location: "Amphitheatre",
    desc: "Live indie band performances, food trucks, and evening light show.",
    color: "bg-[#FF007A] text-white",
  },
];

const LocalCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((i) => (i === 0 ? HIGHLIGHT_EVENTS.length - 1 : i - 1));
  };

  const next = () => {
    setCurrentIndex((i) => (i === HIGHLIGHT_EVENTS.length - 1 ? 0 : i + 1));
  };

  const current = HIGHLIGHT_EVENTS[currentIndex];

  return (
    <div className="brutal-card bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000] relative overflow-hidden my-6">
      <div className="flex items-center justify-between border-b-4 border-black pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-[#00FF66] border-2 border-black flex items-center justify-center font-black">
            <FaFire />
          </span>
          <h3 className="font-heading font-black text-lg uppercase tracking-tight text-black">
            Trending & Spotlight Events
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="brutal-btn bg-white text-black w-8 h-8 flex items-center justify-center text-xs font-black"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={next}
            className="brutal-btn bg-white text-black w-8 h-8 flex items-center justify-center text-xs font-black"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <span className={`brutal-badge ${current.color} inline-block`}>
            {current.tag}
          </span>
          <h2 className="font-heading font-black text-2xl md:text-3xl uppercase tracking-tight text-black">
            {current.title}
          </h2>
          <p className="text-xs font-medium text-black leading-relaxed">
            {current.desc}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-black pt-2">
            <span className="flex items-center gap-1.5 bg-[#F4F4F0] border-2 border-black px-2.5 py-1">
              <FaCalendarAlt className="text-[#FF007A]" /> {current.date}
            </span>
            <span className="flex items-center gap-1.5 bg-[#F4F4F0] border-2 border-black px-2.5 py-1">
              <FaMapMarkerAlt className="text-[#00F0FF]" /> {current.location}
            </span>
          </div>
        </div>

        <div className="bg-[#FFE600] border-4 border-black p-5 brutal-shadow text-center flex flex-col justify-center items-center">
          <p className="text-[10px] font-black uppercase text-black">SPOTLIGHT TICKET</p>
          <p className="font-heading font-black text-xl text-black my-2">ENTRY OPEN</p>
          <button
            onClick={() => alert(`RSVP request initiated for ${current.title}`)}
            className="brutal-btn bg-black text-white px-5 py-2 text-xs uppercase font-black"
          >
            Claim Pass →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalCarousel;
