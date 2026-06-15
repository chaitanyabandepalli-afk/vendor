import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, User, Star } from 'lucide-react';

export default function Topbar({ userRole }) {
  const location = useLocation();

  // Map route paths to friendly title names
  const pageTitles = {
    '/dashboard': 'Dashboard Overview',
    '/vendors': 'Vendor Directories',
    '/vendors/new': 'Onboard New Vendor',
    '/ratings/new': 'Event Performance Rating',
    '/blacklist': 'Blacklist Management',
    '/recommendations': 'Vendor Recommendations',
    '/reports': 'Analytics & Performance Reports',
    '/settings': 'Scoring Rules Settings'
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (pageTitles[path]) return pageTitles[path];
    if (path.startsWith('/vendors/')) return 'Vendor Profile Details';
    return 'SLV Events Management';
  };

  return (
    <header className="h-16 glass-panel border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Page Title */}
      <h2 className="text-xl font-bold tracking-tight text-white m-0">
        {getPageTitle()}
      </h2>

      {/* Right Header Actions */}
      <div className="flex items-center gap-6">
        {location.pathname !== '/ratings/new' && (
          <Link
            to="/ratings/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-bold text-white shadow-md hover:shadow-purple-500/10 transition-all hover:scale-[1.02]"
          >
            <Star className="w-3.5 h-3.5 fill-white" />
            <span>Rate Vendor</span>
          </Link>
        )}

        {/* User profile indicator */}
        <div className="flex items-center gap-2.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs">
          <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
            <User className="w-3 h-3" />
          </div>
          <span className="text-gray-300 font-semibold">{userRole || 'Event Planner'}</span>
        </div>
      </div>
    </header>
  );
}
