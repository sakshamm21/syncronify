'use client' 

import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className='px-10 py-2 flex flex-row-reverse items-center gap-5 border-b border-slate-200 bg-white text-slate-700 shadow-sm'>
      <button className='p-2 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-sm font-bold'>
        U
      </button>
      <Link href='about' className="hover:text-indigo-600 transition-colors">About Us</Link>
      <Link href='contact' className="hover:text-indigo-600 transition-colors">Contact</Link>
    </nav>
  );
};

export default Navbar
  