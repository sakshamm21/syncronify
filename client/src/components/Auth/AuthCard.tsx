import React from 'react';

export const labelClass = 'block text-xs font-black uppercase mb-1 text-black';
export const inputClass = 'w-full bg-[#F4F4F0] border-2 border-black p-3 font-bold text-xs outline-none focus:bg-white';
export const primaryButtonClass =
  'brutal-btn bg-[#00FF66] text-black w-full py-3.5 text-xs uppercase font-black tracking-wider flex items-center justify-center gap-2 disabled:opacity-60';
export const linkButtonClass = 'underline font-black text-[#FF007A] hover:text-black';

interface AuthCardProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="brutal-card bg-white border-4 border-black p-8 shadow-[10px_10px_0px_#000]">
        <div className="flex flex-col items-center mb-6 text-center">
          <img src="/logo.png" alt="Syncronify" className="w-16 h-16 border-4 border-black brutal-shadow mb-3 object-cover" />
          <h2 className="font-heading font-black text-3xl uppercase tracking-tight text-black">{title}</h2>
          {subtitle && <div className="text-xs font-bold text-black mt-1">{subtitle}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

/** Inline error shown under a form. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="bg-[#FF007A] text-white border-2 border-black px-3 py-2 text-xs font-bold">
      {message}
    </p>
  );
}
