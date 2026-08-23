"use client"

import Link from 'next/link';
import LandingCard from '@/components/LandingCard/LandingCard';
import Navbar from '@/components/Navbar/Navbar';
import { useRouter } from 'next/navigation';
import { FaCalendar, FaFileAlt, FaMapMarkedAlt, FaUsers, FaLayerGroup, FaArrowRight, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';

const LandingPage = () => {
  const router = useRouter();

  const cardDetails = [
    {
      icon: FaLayerGroup,
      title: "Event Hub",
      description: "Discover and participate in upcoming events. Filter by category, track registrations, and manage schedules.",
      badge: "EVENTS",
      bg: "bg-[#FFFFFF]",
    },
    {
      icon: FaCalendar,
      title: "Interactive Schedule",
      description: "Manage timelines and team calendars with real-time schedule tracking and agenda views.",
      badge: "CALENDAR",
      bg: "bg-[#FFFFFF]",
    },
    {
      icon: FaMapMarkedAlt,
      title: "Venue & Maps",
      description: "Navigate to event venues with interactive location mapping and address details.",
      badge: "MAPS",
      bg: "bg-[#FFFFFF]",
    },
    {
      icon: FaFileAlt,
      title: "Notes & Agenda",
      description: "Organize meeting summaries, speaker agendas, and event notes in one central console.",
      badge: "NOTES",
      bg: "bg-[#FFFFFF]",
    },
    {
      icon: FaUsers,
      title: "Role Access",
      description: "Dedicated interfaces for Attendees, Organizers, and Administrators with custom permissions.",
      badge: "ACCESS",
      bg: "bg-[#FFFFFF]",
    },
  ];

  const handleNavigation = () => {
    router.push('/authentication');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans selection:bg-[#FFE600] flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 w-full">
        <div className="brutal-card bg-[#FFFFFF] border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_#000] relative overflow-hidden">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Hero Text Left */}
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 brutal-badge bg-[#FFE600] text-black text-xs font-black">
                <FaCheckCircle className="text-black" />
                <span>SYNCRONIFY EVENT PLATFORM</span>
              </div>

              <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-black leading-none">
                Write. Plan. Attend.
                <span className="block bg-[#00F0FF] text-black px-2 py-1 border-2 border-black w-fit mt-2 brutal-shadow-sm">
                  Zero Chaos.
                </span>
              </h1>

              <p className="text-sm md:text-base font-bold text-black leading-relaxed max-w-xl">
                Unify event scheduling, venue mapping, attendee management, and team updates into one clear, reliable workspace.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleNavigation}
                  className="brutal-btn bg-[#FFE600] text-black px-8 py-3.5 text-sm font-black uppercase flex items-center gap-3 brutal-shadow-lg hover:bg-[#00FF66]"
                >
                  <span>Launch Platform</span>
                  <FaArrowRight />
                </button>

                <Link
                  href="/authentication"
                  className="brutal-btn bg-white text-black px-6 py-3.5 text-sm font-black uppercase"
                >
                  Admin Console →
                </Link>
              </div>
            </div>

            {/* Hero Graphics Right */}
            <div className="md:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-[#FFE600] border-4 border-black p-6 brutal-shadow-xl space-y-4">
                <div className="bg-black text-white p-3 font-heading font-black text-sm uppercase flex justify-between items-center">
                  <span>FEATURED EVENTS</span>
                  <span className="w-3 h-3 bg-[#00FF66] rounded-full animate-ping" />
                </div>

                <div className="bg-white border-2 border-black p-4 space-y-2">
                  <span className="brutal-badge bg-[#FF007A] text-white">UPCOMING</span>
                  <p className="font-heading font-black text-lg text-black">Global Tech Summit</p>
                  <p className="text-xs font-bold text-black">📍 Main Auditorium • 10:00 AM</p>
                </div>

                <div className="bg-white border-2 border-black p-4 space-y-2">
                  <span className="brutal-badge bg-[#00F0FF] text-black">WORKSHOP</span>
                  <p className="font-heading font-black text-lg text-black">Design & Innovation Hackathon</p>
                  <p className="text-xs font-bold text-black">📍 Innovation Lab • 02:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12 space-y-2">
          <span className="brutal-badge bg-[#FF007A] text-white">PLATFORM FEATURES</span>
          <h2 className="font-heading font-black text-3xl md:text-4xl uppercase text-black">
            Built For Seamless Event Execution
          </h2>
          <p className="text-xs font-bold uppercase text-black max-w-xl mx-auto">
            Essential management tools engineered with clarity and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardDetails.map((detail, i) => (
            <LandingCard key={i} detail={detail} />
          ))}
        </div>
      </section>

      {/* Call To Action Footer Banner */}
      <section className="max-w-7xl mx-auto px-6 pb-16 w-full">
        <div className="brutal-card bg-[#FFE600] border-4 border-black p-8 md:p-12 shadow-[10px_10px_0px_#000] text-center space-y-6">
          <h2 className="font-heading font-black text-3xl md:text-4xl uppercase text-black">
            Streamline Your Event Management
          </h2>
          <p className="text-xs font-extrabold uppercase text-black max-w-lg mx-auto">
            Empower organizers, teams, and attendees with a unified event platform.
          </p>
          <button
            onClick={handleNavigation}
            className="brutal-btn bg-black text-white px-10 py-4 text-sm font-black uppercase tracking-wider hover:bg-[#FF007A]"
          >
            Get Started →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-black">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Syncronify" className="w-6 h-6 object-contain" />
            <span className="font-heading font-black text-sm uppercase">SYNCRONIFY</span>
          </div>
          <p>© {new Date().getFullYear()} Syncronify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
