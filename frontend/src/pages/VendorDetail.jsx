import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vendorService } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ScoreBadge from '../components/ScoreBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Toast from '../components/Toast.jsx';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  ClipboardList,
  History,
  FolderOpen
} from 'lucide-react';

export default function VendorDetail({ activeRole }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tabs State
  const [activeTab, setActiveTab] = useState('overview');

  // Deletion Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getById(id);
      setVendor(data);
      setError('');
    } catch (err) {
      console.error("Fetch vendor details error:", err);
      setError('Failed to load vendor profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const handleDelete = async () => {
    try {
      await vendorService.delete(id);
      setToast({ message: "Vendor deleted successfully.", type: 'success' });
      setTimeout(() => {
        navigate('/vendors');
      }, 1500);
    } catch (err) {
      console.error("Delete vendor error:", err);
      setToast({ message: "Failed to delete vendor profile.", type: 'error' });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) return <LoadingSpinner message="Retrieving vendor records..." />;
  if (error) return <div className="p-8 text-center text-red-400 font-semibold">{error}</div>;
  if (!vendor) return null;

  // Calculate rebook ratio
  const rebookRatio = vendor.totalEvents > 0
    ? Math.round(((vendor.totalEvents - vendor.noRebookCount) / vendor.totalEvents) * 100)
    : 100;

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'history', label: `Rating History (${vendor.ratings.length})`, icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'logs', label: `Status Logs (${vendor.statusHistories.length})`, icon: <History className="w-4 h-4" /> }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Breadcrumb / Action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/vendors')}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white">{vendor.name}</h1>
              <StatusBadge status={vendor.status} />
            </div>
            <span className="text-sm text-gray-400">{vendor.category}</span>
          </div>
        </div>

        {/* Edit / Delete Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to={`/vendors/${vendor.id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-gray-300 text-sm font-bold transition-all"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-950/20 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-sm font-bold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Vendor</span>
          </button>
        </div>
      </div>

      {/* Profile Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-xl flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quality Score</span>
            <div className="flex items-center mt-1">
              <ScoreBadge score={vendor.averageScore} size="lg" showPercentage />
            </div>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-400 opacity-30" />
        </div>

        <div className="glass-card p-5 rounded-xl flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Events Served</span>
            <span className="text-2xl font-extrabold text-white mt-1">{vendor.totalEvents}</span>
          </div>
          <Calendar className="w-8 h-8 text-blue-400 opacity-30" />
        </div>

        <div className="glass-card p-5 rounded-xl flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Rebooking Ratio</span>
            <span className="text-2xl font-extrabold text-white mt-1">{rebookRatio}%</span>
            <span className="text-[10px] text-gray-400 font-semibold">{vendor.noRebookCount} Negative ratings</span>
          </div>
          <ClipboardList className="w-8 h-8 text-green-400 opacity-30" />
        </div>

        <div className="glass-card p-5 rounded-xl flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Risk Level</span>
            <span className={`text-lg font-bold mt-1 uppercase ${
              vendor.riskLevel === 'High' ? 'text-red-400' : vendor.riskLevel === 'Medium' ? 'text-orange-400' : 'text-green-400'
            }`}>{vendor.riskLevel}</span>
            <span className="text-[10px] text-gray-400 font-semibold">{vendor.severeIssueCount} Severe issues</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-red-400 opacity-30" />
        </div>
      </div>

      {/* Alert Block if Warning / Blacklisted */}
      {vendor.status !== 'Active' && vendor.blacklistReason && (
        <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/20 flex gap-3 text-orange-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold">Security Alert / Status Flag Reason:</span>
            <p className="text-gray-300 text-xs leading-relaxed">{vendor.blacklistReason}</p>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="border-b border-white/10 flex gap-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id 
                ? 'border-purple-500 text-purple-400 font-extrabold' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* Tab A: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Contact details */}
            <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-4 lg:col-span-2">
              <h3 className="text-base font-bold text-white mb-2">Business Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase font-semibold">Contact Person</span>
                  <p className="text-white font-medium">{vendor.contactPerson}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase font-semibold">Phone Number</span>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{vendor.phone}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase font-semibold">Email Address</span>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{vendor.email}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase font-semibold">Location / Office</span>
                  <p className="text-white font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{vendor.location}</span>
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <span className="text-xs text-gray-400 uppercase font-semibold">GSTIN / Registration ID</span>
                  <p className="text-white font-mono">{vendor.businessId || 'Not Registered'}</p>
                </div>
              </div>

              {vendor.notes && (
                <div className="pt-4 border-t border-white/5 space-y-1">
                  <span className="text-xs text-gray-400 uppercase font-semibold">Profile Notes</span>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{vendor.notes}</p>
                </div>
              )}
            </div>

            {/* Risk Factors Panel */}
            <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white">Risk Factor Diagnostics</h3>
              <div className="space-y-4 text-sm">
                
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Total Events Rated</span>
                  <span className="font-bold text-white">{vendor.totalEvents}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Negative Reviews</span>
                  <span className={`font-bold ${vendor.noRebookCount > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {vendor.noRebookCount}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Severe Service Issues</span>
                  <span className={`font-bold ${vendor.severeIssueCount > 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                    {vendor.severeIssueCount}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2">
                  <span className="text-gray-400">Compliance Standing</span>
                  <span className={`font-bold ${
                    vendor.status === 'Active' ? 'text-green-400' : vendor.status === 'Warning' ? 'text-orange-400' : 'text-red-400'
                  }`}>{vendor.status === 'Active' ? 'Exemplary' : vendor.status === 'Warning' ? 'Probation' : 'Suspended'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab B: Rating History */}
        {activeTab === 'history' && (
          <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
            {vendor.ratings.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-semibold uppercase tracking-wider">
                This vendor has not received any ratings yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 bg-white/5">
                      <th className="p-4">Event Details</th>
                      <th className="p-4">Score Breakdown</th>
                      <th className="p-4">Final Score</th>
                      <th className="p-4">Issues Raised</th>
                      <th className="p-4">Rebook?</th>
                      <th className="p-4">Evaluator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor.ratings.map(rating => (
                      <tr key={rating.id} className="border-b border-white/5 hover:bg-white/5 text-sm transition-all align-top">
                        
                        {/* Event details & date */}
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{rating.eventName}</span>
                            <span className="text-[11px] text-gray-400">{rating.eventType} • {formatDate(rating.eventDate)}</span>
                            <span className="text-[11px] text-gray-500 mt-1">{rating.venue}</span>
                          </div>
                        </td>

                        {/* Star breakdown */}
                        <td className="p-4 text-xs space-y-1">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                            <div>Punctuality: <span className="font-semibold text-white">{rating.punctuality}/5</span></div>
                            <div>Quality: <span className="font-semibold text-white">{rating.quality}/5</span></div>
                            <div>Professionalism: <span className="font-semibold text-white">{rating.professionalism}/5</span></div>
                            <div>Communication: <span className="font-semibold text-white">{rating.communication}/5</span></div>
                            <div className="col-span-2">Cost Behavior: <span className="font-semibold text-white">{rating.costBehavior}/5</span></div>
                          </div>
                        </td>

                        {/* Final score badge */}
                        <td className="p-4">
                          <div className="flex flex-col items-start gap-1">
                            <ScoreBadge score={rating.finalScore} size="sm" showPercentage />
                          </div>
                        </td>

                        {/* Issues checklist */}
                        <td className="p-4 max-w-xs text-xs">
                          {rating.issues ? (
                            <div className="flex flex-wrap gap-1">
                              {rating.issues.split(',').map((issue, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950/20 text-red-400 border border-red-500/20">
                                  {issue.trim()}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                        </td>

                        {/* Would rebook check */}
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                            rating.wouldRebook ? 'text-green-400 bg-green-950/20' : 'text-red-400 bg-red-950/20'
                          }`}>
                            {rating.wouldRebook ? 'Yes' : 'No'}
                          </span>
                        </td>

                        {/* Rated by & comments */}
                        <td className="p-4">
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold text-white">{rating.ratedBy}</span>
                            <span className="text-gray-400 italic mt-1.5 block max-w-xs overflow-hidden text-ellipsis line-clamp-2" title={rating.feedback}>
                              &ldquo;{rating.feedback}&rdquo;
                            </span>
                            {rating.adminNotes && (
                              <span className="text-[10px] text-gray-500 bg-white/5 p-1 rounded mt-2 border border-white/5">
                                <b>Admin:</b> {rating.adminNotes}
                              </span>
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
        )}

        {/* Tab C: Status Histories */}
        {activeTab === 'logs' && (
          <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
            {vendor.statusHistories.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-semibold uppercase tracking-wider">
                No status adjustments recorded. Initial account creation details only.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 bg-white/5">
                      <th className="p-4">Date Adjusted</th>
                      <th className="p-4">State Transition</th>
                      <th className="p-4">Adjustment Reason</th>
                      <th className="p-4">Adjusted By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor.statusHistories.map(log => (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 text-sm transition-all">
                        <td className="p-4 text-gray-400">{formatDate(log.createdAt)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={log.oldStatus} />
                            <span className="text-gray-500">➜</span>
                            <StatusBadge status={log.newStatus} />
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 max-w-md break-words text-xs">{log.reason}</td>
                        <td className="p-4 font-bold text-gray-400 text-xs">{log.changedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Vendor Profile?"
        message={`Are you sure you want to delete vendor "${vendor.name}"? This operation will remove all associated ratings and records, and cannot be undone.`}
        confirmText="Delete Vendor"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDangerous={true}
      />
    </div>
  );
}
