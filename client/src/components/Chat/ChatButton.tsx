"use client"

import React from 'react';
import { FaComments } from 'react-icons/fa';

interface ChatButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 brutal-btn bg-[#FFE600] text-black px-4 py-3 text-xs font-black uppercase flex items-center gap-2 shadow-[4px_4px_0px_#000]"
    >
      <FaComments className="text-lg" />
      <span>{isOpen ? 'Close Chat' : 'Live Chat'}</span>
    </button>
  );
};

export default ChatButton;
