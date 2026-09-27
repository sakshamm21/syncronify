"use client"

import React, { useEffect, useState } from 'react';
import { FaPaperPlane, FaTimes, FaCircle, FaUserShield, FaComments, FaUsers } from 'react-icons/fa';

interface ChatInterfaceProps {
  onClose?: () => void;
  inline?: boolean;
}

interface MessageItem {
  id: string;
  sender: string;
  role: 'user' | 'admin' | 'system';
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: 'm1',
    sender: 'System Bot',
    role: 'system',
    text: '⚡ Welcome to Syncronify Live Event Channel! Feel free to ask questions about venues, schedules, or registrations.',
    timestamp: '10:00 AM',
  },
  {
    id: 'm2',
    sender: 'Sarah (Admin)',
    role: 'admin',
    text: 'Hi everyone! The main keynote for Tech Summit starts at 11:00 AM sharp in Hall A.',
    timestamp: '10:05 AM',
  },
  {
    id: 'm3',
    sender: 'You',
    role: 'user',
    text: 'Is there parking available near the innovation lab building?',
    timestamp: '10:12 AM',
  },
  {
    id: 'm4',
    sender: 'Sarah (Admin)',
    role: 'admin',
    text: 'Yes! Parking Lot B is open right opposite the Innovation Lab.',
    timestamp: '10:14 AM',
  },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, inline = false }) => {
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [activeChannel, setActiveChannel] = useState<'general' | 'organizer'>('general');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'You',
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulate auto-response from organizer bot after 1s
    setTimeout(() => {
      const botReply: MessageItem = {
        id: `msg-bot-${Date.now()}`,
        sender: 'Event Desk',
        role: 'admin',
        text: 'Received! Our team has logged your inquiry and will update the event bulletin.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
  };

  return (
    <div
      className={`brutal-card bg-white border-4 border-black shadow-[8px_8px_0px_#000] flex flex-col justify-between overflow-hidden ${
        inline ? 'w-full h-[600px]' : 'fixed bottom-4 right-4 z-50 w-full max-w-md h-[550px]'
      }`}
    >
      {/* Header Bar */}
      <div className="bg-[#FFE600] border-b-4 border-black p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black text-sm">
            <FaComments />
          </div>
          <div>
            <h3 className="font-heading font-black text-base uppercase tracking-tight text-black flex items-center gap-1.5">
              Live Event Chat
              <span className="w-2 h-2 rounded-full bg-[#00FF66] inline-block animate-pulse" />
            </h3>
            <p className="text-[10px] font-bold text-black uppercase">
              {activeChannel === 'general' ? 'Public Community Lobby' : 'Direct Organizer Support'}
            </p>
          </div>
        </div>

        {onClose && !inline && (
          <button
            onClick={onClose}
            className="brutal-btn bg-[#FF007A] text-white p-1 text-xs font-black"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Channel Switcher */}
      <div className="bg-[#F4F4F0] border-b-2 border-black p-2 flex gap-2">
        <button
          onClick={() => setActiveChannel('general')}
          className={`flex-1 brutal-btn text-[11px] py-1 uppercase flex items-center justify-center gap-1.5 ${
            activeChannel === 'general' ? 'bg-[#00F0FF] text-black' : 'bg-white text-black'
          }`}
        >
          <FaUsers /> General Chat
        </button>
        <button
          onClick={() => setActiveChannel('organizer')}
          className={`flex-1 brutal-btn text-[11px] py-1 uppercase flex items-center justify-center gap-1.5 ${
            activeChannel === 'organizer' ? 'bg-[#FF007A] text-white' : 'bg-white text-black'
          }`}
        >
          <FaUserShield /> Organizer Desk
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F4F4F0]">
        {messages.map((msg) => {
          const isMe = msg.role === 'user';
          const isSystem = msg.role === 'system';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="brutal-card bg-[#FFE600] p-2.5 text-center text-xs font-bold border-2 border-black"
              >
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase mb-1">
                <span>{msg.sender}</span>
                <span className="text-gray-500 font-mono">{msg.timestamp}</span>
              </div>
              <div
                className={`brutal-card p-3 max-w-[85%] text-xs font-bold leading-relaxed border-2 border-black ${
                  isMe
                    ? 'bg-[#00F0FF] text-black shadow-[3px_3px_0px_#000]'
                    : 'bg-white text-black shadow-[3px_3px_0px_#000]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="bg-white border-t-4 border-black p-3 flex gap-2">
        <input
          type="text"
          placeholder="Type message to event attendees..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-xs outline-none"
        />
        <button
          type="submit"
          className="brutal-btn bg-[#00FF66] text-black px-4 py-2 text-xs font-black uppercase flex items-center justify-center"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
