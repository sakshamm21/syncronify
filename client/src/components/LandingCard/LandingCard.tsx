'use client'

import React from 'react'

interface LandingCardProps {
  detail: {
    icon: React.ElementType;
    title: string;
    description: string;
    badge?: string;
    bg?: string;
  }
}

const LandingCard: React.FC<LandingCardProps> = ({ detail }) => {
  const cardBg = detail.bg || "bg-white";

  return (
    <div className={`brutal-card brutal-card-hover p-6 flex flex-col justify-between ${cardBg}`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-black text-[#FFE600] border-2 border-black brutal-shadow-sm flex items-center justify-center text-xl font-bold">
            {React.createElement(detail.icon)}
          </div>
          {detail.badge && (
            <span className="brutal-badge bg-[#00F0FF] text-black">
              {detail.badge}
            </span>
          )}
        </div>

        <h3 className="font-heading font-extrabold text-xl mb-2 uppercase tracking-tight text-black">
          {detail.title}
        </h3>
        
        <p className="text-xs font-medium text-black leading-relaxed">
          {detail.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-black">FEATURE MODULE</span>
        <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">→</span>
      </div>
    </div>
  )
}

export default LandingCard