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
      description: "Discover, filter, and attend top college and organization events. Complete with instant RSVP tracking and attendee lists.",
      badge: "CORE HUB",
      bg: "bg-[#FFFFFF]",
    },
    {
      icon: FaCalendar,
      title: "Interactive Schedule",
      description: "Manage personal timelines and team event calendars with FullCalendar drag-and-drop support, conflict checks, and view toggles.",
      badge: "CALENDAR",
      bg: "bg-[#FFFFFF]",
    },
    {
      icon: FaMapMarkedAlt,
      title: "Venue & Navigation",
      description: "Find your way to offline event venues with interactive map markers, coordinate selection, and address search.",
      badge: "NAVIGATION",
      bg: "bg-[#FFFFFF]",
    },
    {
      icon: FaFileAlt,
      title: "Notes & Plans",
      description: "Capture meeting summaries, speaker agendas, and event execution notes directly within your personal workspace console.",
      badge: "NOTES API",
      bg: "bg-[#FFFFFF]",
    },
    {
      icon: FaUsers,
      title: "Role-Based Hubs",
      description: "Tailored portals for General Attendees, Organization Admins, and Super Administrators to control permissions and events.",
      badge: "SECURITY",
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
                <span>SYNCRONIFY EVENT PLATFORM V1.0</span>
              </div>

              <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-black leading-none">
                Write. Plan. Attend.
                <span className="block bg-[#00F0FF] text-black px-2 py-1 border-2 border-black w-fit mt-2 brutal-shadow-sm">
                  Zero Chaos.
                </span>
              </h1>

              <p className="text-sm md:text-base font-bold text-black leading-relaxed max-w-xl">
                Consolidate event calendars, venue navigation, execution notes, and real-time team chat into one high-contrast Neo-Brutalist operating system.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleNavigation}
                  className="brutal-btn bg-[#FFE600] text-black px-8 py-3.5 text-sm font-black uppercase flex items-center gap-3 brutal-shadow-lg hover:bg-[#00FF66]"
                >
                  <span>Launch App Console</span>
                  <FaArrowRight />
                </button>

                <Link
                  href="/authentication"
                  className="brutal-btn bg-white text-black px-6 py-3.5 text-sm font-black uppercase"
                >
                  Admin Portal →
                </Link>
              </div>
            </div>

            {/* Hero Graphics Right */}
            <div className="md:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-[#FFE600] border-4 border-black p-6 brutal-shadow-xl space-y-4">
                <div className="bg-black text-white p-3 font-heading font-black text-sm uppercase flex justify-between items-center">
                  <span>LIVE EVENT BULLETIN</span>
                  <span className="w-3 h-3 bg-[#00FF66] rounded-full animate-ping" />
                </div>

                <div className="bg-white border-2 border-black p-4 space-y-2">
                  <span className="brutal-badge bg-[#FF007A] text-white">UPCOMING</span>
                  <p className="font-heading font-black text-lg text-black">⚡ TECH SUMMIT 2026</p>
                  <p className="text-xs font-bold text-black">📍 Main Auditorium • 10:00 AM</p>
                </div>

                <div className="bg-white border-2 border-black p-4 space-y-2">
                  <span className="brutal-badge bg-[#00F0FF] text-black">WORKSHOP</span>
                  <p className="font-heading font-black text-lg text-black">🎨 NEO-BRUTALIST DESIGN</p>
                  <p className="text-xs font-bold text-black">📍 Innovation Lab • 02:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="bg-[#00F0FF] border-y-4 border-black py-6">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="border-r-2 border-black last:border-r-0">
            <p className="font-heading font-black text-3xl md:text-4xl text-black">5,000+</p>
            <p className="text-xs font-black uppercase text-black">Events Scheduled</p>
          </div>
          <div className="border-r-2 border-black last:border-r-0">
            <p className="font-heading font-black text-3xl md:text-4xl text-black">150+</p>
            <p className="text-xs font-black uppercase text-black">Active Communities</p>
          </div>
          <div className="border-r-2 border-black last:border-r-0">
            <p className="font-heading font-black text-3xl md:text-4xl text-black">99.9%</p>
            <p className="text-xs font-black uppercase text-black">Real-Time Sync</p>
          </div>
          <div>
            <p className="font-heading font-black text-3xl md:text-4xl text-black">3 ROLES</p>
            <p className="text-xs font-black uppercase text-black">Permission Security</p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12 space-y-2">
          <span className="brutal-badge bg-[#FF007A] text-white">SYSTEM MODULES</span>
          <h2 className="font-heading font-black text-3xl md:text-4xl uppercase text-black">
            Everything Built For Flawless Execution
          </h2>
          <p className="text-xs font-bold uppercase text-black max-w-xl mx-auto">
            High performance event tools engineered with stark clarity and responsiveness.
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
            Ready to streamline your event workflow?
          </h2>
          <p className="text-xs font-extrabold uppercase text-black max-w-lg mx-auto">
            Join thousands of student leaders, event organizers, and attendees on Syncronify.
          </p>
          <button
            onClick={handleNavigation}
            className="brutal-btn bg-black text-white px-10 py-4 text-sm font-black uppercase tracking-wider hover:bg-[#FF007A]"
          >
            Get Started Now →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-black">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-[#FFE600] border border-black flex items-center justify-center font-black">
              ⚡
            </span>
            <span className="font-heading font-black text-sm uppercase">SYNCRONIFY OS</span>
          </div>
          <p>© {new Date().getFullYear()} Syncronify Event Management. Built with Neo-Brutalism design system.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
