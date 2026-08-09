import React from 'react'

const LandingCard = ({ detail }: { detail: { icon: React.ElementType; title: string; description: string } }) => {
  return (
    <div className='group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col'>
      <div className="flex flex-col gap-4 flex-1">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
          {React.createElement(detail.icon, { fontSize: '24px' })}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{detail.title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed flex-1">{detail.description}</p>
        <button className='w-fit text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors'>
          Read More →
        </button>
      </div>
    </div>
  )
}

export default LandingCard