import React from 'react';

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-10 h-10 border-4',
    large: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`${sizeClasses[size] || sizeClasses.medium} border-white/10 border-t-purple-500 rounded-full animate-spin`} />
      {message && <p className="text-sm text-gray-400 font-medium">{message}</p>}
    </div>
  );
}
