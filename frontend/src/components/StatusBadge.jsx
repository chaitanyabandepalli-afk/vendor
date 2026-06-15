import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-green-500/10 text-green-400 border-green-500/30 glow-green',
    Warning: 'bg-orange-500/10 text-orange-400 border-orange-500/30 glow-orange',
    Blacklisted: 'bg-red-500/10 text-red-400 border-red-500/30 glow-red'
  };

  const currentStyle = styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStyle}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
