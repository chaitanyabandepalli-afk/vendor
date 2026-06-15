import React from 'react';

export default function ScoreBadge({ score, size = 'md', showPercentage = false }) {
  // Score thresholds
  // >= 4.0 = green
  // >= 3.2 = yellow-green
  // >= 2.5 = orange
  // < 2.5 = red
  const getColors = (val) => {
    if (val >= 4.0) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (val >= 3.2) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (val >= 2.5) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const colors = getColors(score);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 border',
    md: 'text-sm px-2.5 py-1 border',
    lg: 'text-base px-3 py-1.5 border'
  };

  const formattedScore = typeof score === 'number' ? score.toFixed(1) : '0.0';
  const percentage = typeof score === 'number' ? Math.round((score / 5.0) * 100) : 0;

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-lg ${sizeClasses[size] || sizeClasses.md} ${colors}`}>
      <span>★</span>
      <span>{formattedScore}</span>
      {showPercentage && (
        <span className="text-[10px] font-normal opacity-85 ml-0.5">({percentage}%)</span>
      )}
    </span>
  );
}
