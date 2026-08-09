"use client"

import Login from '@/components/Login/Login'
import UserRegister from '@/components/UserRegister/UserRegister'
import React, { useState } from 'react'

const Authentication = () => {
  const [newUser, setNewUser] = useState(true);

  const handleClick = () => {
    setNewUser(!newUser);
  }

  return (
    <div className='relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-10'>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-violet-200/40 blur-3xl"></div>
      </div>
      {!newUser ?
        <Login handleClick={() => handleClick()} /> :
        <UserRegister handleClick={() => handleClick()} />}
    </div>
  )
}

export default Authentication