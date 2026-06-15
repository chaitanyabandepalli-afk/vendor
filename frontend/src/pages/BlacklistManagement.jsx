import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blacklistService, vendorService } from '../services/api.js';
import ScoreBadge from '../components/ScoreBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Toast from '../components/Toast.jsx';
import { 
  ShieldAlert, 
  UserCheck, 
  Trash2, 
  MapPin, 
  ArrowRight,
  RefreshCw,
  Eye,
  AlertTriangle
} from 'lucide-react';

export default function BlacklistManagement({ activeRole }) {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Override Modal State
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [targetVendor, setTargetVendor] = useState(null);
  const [newStatus, setNewStatus] = useState('Active');
  const [overrideReason, setOverrideReason] = useState('');
  
  const [toast, setToast] = useState(null);

  const fetchFlaggedVendors = async () => {
    try {
      setLoading(true);
      const data = await blacklistService.getAll();
      setVendors(data);
      setError('');
    } catch (err) {
      console.error("Fetch blacklist error:", err);
      setError('Failed to load warning and blacklist records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedVendors();
  }, []);

  const handleOverrideClick = (vendor, status) => {
    setTargetVendor(vendor);
    setNewStatus(status);
    setOverrideReason('');
    setIsOverrideOpen(true);
  };

  const handleConfirmOverride = async () => {
    if (!targetVendor || !overrideReason.trim()) {
      setToast({ message: "Override reason is required.", type: 'warning' });
      return;
    }

    try {
      await vendorService.overrideStatus(
        targetVendor.id, 
        newStatus, 
        overrideReason, 
        `Override by ${activeRole || 'Admin'}`
      );
      setToast({ message: `Status updated to ${newStatus} for "${targetVendor.name}"`, type: 'success' });
      fetchFlaggedVendors();
    } catch (err) {
      console.error("Override status error:", err);
      setToast({ message: "Failed to update status override.", type: 'error' });
    } finally {
      setIsOverrideOpen(false);
      setTargetVendor(null);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Blacklist & Risk Management</h1>
          <p className="text-sm text-gray-400">Review system-flagged warnings and manually override vendor standings</p>
        </div>
        <button
          onClick={fetchFlaggedVendors}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Statuses</span>
        </button>
      </div>

      {/* Overview Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        <div className="p-4 rounded-xl glass-panel border border-red-500/20 text-red-200">
          <h4 className="font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Blacklist Criteria</span>
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-gray-300">
            <li>Average quality score falls below 2.5</li>
            <li>Last-minute cancellation AND client complaint present</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-orange-500/20 text-orange-200">
          <h4 className="font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <span>Warning Criteria</span>
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-gray-300">
            <li>Average score between 2.5 and 3.2</li>
            <li>Accumulated 2 or more severe service issues</li>
            <li>Marked 'Would not rebook' for 3 or more events</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-purple-500/20 text-purple-200">
          <h4 className="font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Override Protocol</span>
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-gray-300">
            <li>Admins can bypass rules and reset status</li>
            <li>All status overrides are logged in histories</li>
          </ul>
        </div>
      </div>

      {/* Flagged directory list */}
      <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
        {loading ? (
          <LoadingSpinner message="Filtering risk listings..." />
        ) : error ? (
          <div className="p-8 text-center text-red-400 font-semibold">{error}</div>
        ) : vendors.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-semibold uppercase tracking-wider">
            All onboarded suppliers are currently in active/healthy standing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 bg-white/5">
                  <th className="p-4">Vendor Details</th>
                  <th>Current Rating</th>
                  <th>Standing Status</th>
                  <th>Flag Reason / Detail</th>
                  <th>Log Profile</th>
                  <th className="p-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 text-sm transition-all align-top">
                    
                    {/* Basic details */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base">{v.name}</span>
                        <span className="text-xs text-gray-400">{v.category}</span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-0.5 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{v.location}</span>
                        </span>
                      </div>
                    </td>

                    {/* Ratings */}
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <ScoreBadge score={v.averageScore} size="sm" showPercentage />
                        <span className="text-[10px] text-gray-500 font-semibold">{v.totalEvents} ratings</span>
                      </div>
                    </td>

                    {/* Standing */}
                    <td className="p-4">
                      <StatusBadge status={v.status} />
                    </td>

                    {/* Flag reason */}
                    <td className="p-4 max-w-sm text-xs text-gray-300">
                      <p className="leading-relaxed whitespace-pre-wrap">{v.blacklistReason || "Flagged automatically based on ratings statistics."}</p>
                      <div className="mt-2 flex gap-3 text-[10px] text-gray-500 font-bold uppercase">
                        <span>Issues: {v.severeIssueCount}</span>
                        <span>No-Rebook: {v.noRebookCount}</span>
                      </div>
                    </td>

                    {/* Override status details */}
                    <td className="p-4 text-xs text-gray-400">
                      <div className="flex flex-col">
                        <span>Updated: {new Date(v.lastChangedAt).toLocaleDateString()}</span>
                        <span className="font-semibold text-white">By: {v.lastChangedBy}</span>
                        {v.isManualOverride && (
                          <span className="px-1.5 py-0.5 mt-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px] font-bold self-start uppercase">
                            Manual Override
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/vendors/${v.id}`)}
                          title="View Details"
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/5"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {v.status !== 'Active' && (
                          <button
                            onClick={() => handleOverrideClick(v, 'Active')}
                            className="px-2.5 py-1.5 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/20 transition-all"
                          >
                            Set Active
                          </button>
                        )}
                        
                        {v.status !== 'Warning' && (
                          <button
                            onClick={() => handleOverrideClick(v, 'Warning')}
                            className="px-2.5 py-1.5 rounded bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/20 transition-all"
                          >
                            Set Warning
                          </button>
                        )}

                        {v.status !== 'Blacklisted' && (
                          <button
                            onClick={() => handleOverrideClick(v, 'Blacklisted')}
                            className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition-all"
                          >
                            Blacklist
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Override Reason Dialog Modal */}
      {isOverrideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-panel rounded-xl shadow-2xl border border-white/10 animate-fade-in overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-purple-400" />
                <span>Override Standing Status</span>
              </h3>
              <button 
                onClick={() => setIsOverrideOpen(false)}
                className="p-1 text-gray-500 hover:text-white rounded"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-300">
                You are changing status for <span className="font-bold text-white">"{targetVendor?.name}"</span>:
                <div className="flex items-center gap-2 mt-2 font-semibold text-xs">
                  <StatusBadge status={targetVendor?.status} />
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                  <StatusBadge status={newStatus} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Override Reason *</label>
                <textarea
                  rows="3"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Provide justifying details for override standing..."
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 bg-white/5 border-t border-white/10">
              <button
                onClick={() => setIsOverrideOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverride}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-lg"
              >
                Apply Override
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
