import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import AIChatbot from './components/AIChatbot.jsx';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import VendorList from './pages/VendorList.jsx';
import VendorForm from './pages/VendorForm.jsx';
import VendorDetail from './pages/VendorDetail.jsx';
import RatingForm from './pages/RatingForm.jsx';
import BlacklistManagement from './pages/BlacklistManagement.jsx';
import Recommendations from './pages/Recommendations.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';

// Layout wrapper for authenticated dashboard pages
function DashboardLayout({ user, onLogout, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#07080a] text-gray-100">
      <Sidebar userRole={user.role} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar userRole={user.role} />
        <main className="flex-1 overflow-y-auto pb-12">
          {children}
        </main>
        <AIChatbot />
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('slv_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('slv_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('slv_user');
  };

  return (
    <Router>
      <Routes>
        {/* Public login route */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          } 
        />

        {/* Authenticated Dashboard routes */}
        <Route 
          path="/dashboard" 
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <Dashboard />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/vendors" 
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <VendorList />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/vendors/new" 
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <VendorForm />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/vendors/:id" 
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <VendorDetail activeRole={user?.role} />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/vendors/:id/edit" 
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <VendorForm />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/ratings/new" 
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <RatingForm activeRole={user?.role} />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/blacklist" 
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <BlacklistManagement activeRole={user?.role} />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/recommendations" 
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <Recommendations />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/reports" 
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <Reports />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <Settings />
            </DashboardLayout>
          } 
        />

        {/* Redirect from root to dashboard */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />

        {/* Catch-all redirect to dashboard */}
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </Router>
  );
}
