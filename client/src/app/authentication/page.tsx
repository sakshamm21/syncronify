"use client"

import React, { useState } from 'react';
import Login from '@/components/Login/Login';
import UserRegister from '@/components/UserRegister/UserRegister';
import Navbar from '@/components/Navbar/Navbar';

const Authentication = () => {
  const [newUser, setNewUser] = useState(false);

  const toggleMode = () => {
    setNewUser(!newUser);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 my-8">
        {!newUser ? (
          <Login handleClick={toggleMode} />
        ) : (
          <UserRegister handleClick={toggleMode} />
        )}
      </main>

      <footer className="border-t-4 border-black bg-white py-4 text-center text-xs font-bold text-black">
        ⚡ Syncronify Authentication Console — Secure JWT Session System
      </footer>
    </div>
  );
};

export default Authentication;