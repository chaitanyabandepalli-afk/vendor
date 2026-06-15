import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: {
      bg: 'rgba(20, 83, 45, 0.9)',
      border: 'border-green-500/30',
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      text: 'text-green-100'
    },
    warning: {
      bg: 'rgba(124, 45, 18, 0.9)',
      border: 'border-orange-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      text: 'text-orange-100'
    },
    error: {
      bg: 'rgba(127, 29, 29, 0.9)',
      border: 'border-red-500/30',
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      text: 'text-red-100'
    },
    info: {
      bg: 'rgba(30, 58, 138, 0.9)',
      border: 'border-blue-500/30',
      icon: <Info className="w-5 h-5 text-blue-400" />,
      text: 'text-blue-100'
    }
  };

  const currentStyle = styles[type] || styles.success;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} backdrop-blur-md animate-fade-in`}>
      {currentStyle.icon}
      <span className="text-sm font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="p-0.5 hover:bg-white/10 rounded transition-colors ml-4"
      >
        <X className="w-4 h-4 text-white/70 hover:text-white" />
      </button>
    </div>
  );
}
