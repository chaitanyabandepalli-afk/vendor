import React from 'react';

export default function StatCard({ title, value, icon, subtext, trend, trendType = 'neutral', onClick }) {
  const trendColorClass = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  }[trendType];

  return (
    <div 
      onClick={onClick}
      className={`glass-card p-5 rounded-xl flex items-center justify-between cursor-pointer ${
        onClick ? 'hover:scale-[1.02]' : ''
      }`}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</span>
        <span className="text-2xl font-extrabold text-white mt-1">{value}</span>
        
        {(subtext || trend) && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            {trend && <span className={`font-bold ${trendColorClass}`}>{trend}</span>}
            {subtext && <span className="text-gray-500 font-medium">{subtext}</span>}
          </div>
        )}
      </div>
      <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400 shadow-inner">
        {icon}
      </div>
    </div>
  );
}
