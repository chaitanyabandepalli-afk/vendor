import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserX, 
  Star, 
  Compass, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ userRole, onLogout }) {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Vendors', path: '/vendors', icon: <Users className="w-5 h-5" /> },
    { name: 'Rate Vendor', path: '/ratings/new', icon: <Star className="w-5 h-5" /> },
    { name: 'Blacklist Alerts', path: '/blacklist', icon: <UserX className="w-5 h-5" /> },
    { name: 'Recommendations', path: '/recommendations', icon: <Compass className="w-5 h-5" /> },
    { name: 'Analytics Reports', path: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/10 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-white leading-none">SLV Events</h1>
          <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Vendor Management</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-purple-300 border-l-2 border-purple-500 shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Session profile */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Role</span>
            <span className="text-sm font-semibold text-white truncate">{userRole || 'Event Planner'}</span>
          </div>
          <button
            onClick={() => {
              if (onLogout) onLogout();
              navigate('/login');
            }}
            title="Sign Out"
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
