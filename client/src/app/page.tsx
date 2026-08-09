"use client"
import Link from 'next/link';
import LandingCard from '@/components/LandingCard/LandingCard';
import { useRouter } from 'next/navigation';
import { FaCalendar, FaFileAlt, FaMap, FaUsers } from 'react-icons/fa';
import { MdEvent } from 'react-icons/md';

const LandingPage = () => {
  const router = useRouter();

  const cardDetail = [
    {
      icon: FaUsers,
      title: "Community",
      description: "Create and join groups to collaborate on team events, share calendars and stay in sync with your circle.",
    },
    {
      icon: FaFileAlt,
      title: "Notes",
      description: "Capture ideas, meeting notes and event plans in one place — everything you need, always at hand.",
    },
    {
      icon: FaMap,
      title: "Navigation",
      description: "Find your way to offline events with built-in venue navigation and interactive maps.",
    },
    {
      icon: FaCalendar,
      title: "Calendar",
      description: "Manage personal and team events on a smart calendar that helps you avoid conflicts and use time wisely.",
    },
    {
      icon: MdEvent,
      title: "Events",
      description: "Discover, plan and attend events effortlessly — from college fests to professional conferences.",
    },
  ]

  const handleNavigation = () => {
    router.push('/authentication');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/40">
      {/* ================= Landing Navigation ======================= */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Syncronify logo" className="h-9 w-9" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Syncronify</h3>
          </div>
          <div className="nav_links hidden md:flex gap-6 items-center text-sm font-medium text-slate-600">
            <Link href="#" className="hover:text-indigo-600 transition-colors">About Us</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Contact Us</Link>
            <Link href="/authentication" className="hover:text-indigo-600 transition-colors">Log In</Link>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
              onClick={handleNavigation}
            >
              GET STARTED
            </button>
          </div>
        </div>
      </nav>

      {/* ================= Landing Intro ======================= */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10 grid md:grid-cols-2 gap-10 items-center">
        <div className="order-2 md:order-1">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            ✦ Event Management Platform
          </span>
          <h1 className="text-5xl font-extrabold text-slate-900 leading-tight">
            Write, plan, share.
            <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              With us at your side.
            </span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 font-medium">
            Swift Event Management, Seamless Team Collaboration, Superior Results!
          </p>
          <button
            className="mt-8 bg-black hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-slate-900/10"
            onClick={handleNavigation}
          >
            GET STARTED →
          </button>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          <img
            src="/landing_pic.png"
            alt="Landing illustration"
            className="max-w-full h-auto rounded-3xl shadow-2xl shadow-indigo-900/10"
          />
        </div>
      </section>

      {/* ================= Feature Intro ======================= */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Everything you need to manage events</h2>
          <p className="mt-3 text-slate-500">One platform for planning, collaboration and execution.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {cardDetail.map((detail, i) => (
            <LandingCard key={i} detail={detail} />
          ))}
        </div>
      </section>

      {/* ================= Footer ======================= */}
      <footer className="border-t border-slate-200 bg-white/70">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Syncronify logo" className="h-6 w-6" />
            <span className="font-semibold text-slate-700">Syncronify</span>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Syncronify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage;




