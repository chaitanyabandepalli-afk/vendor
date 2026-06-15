import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorService } from '../services/api.js';
import ScoreBadge from '../components/ScoreBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Toast from '../components/Toast.jsx';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail,
  ArrowUpDown,
  User
} from 'lucide-react';

const CATEGORIES = [
  "Caterer", "Decorator", "Photographer", "Videographer", 
  "Sound & DJ", "Lighting", "Venue Partner", "Florist", 
  "Transport", "Logistics", "Makeup Artist", "Other"
];

export default function VendorList() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and Search States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal and Toast States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }
      const data = await vendorService.getAll(params);
      setVendors(data);
      setError('');
    } catch (err) {
      console.error("Fetch vendors error:", err);
      setError('Failed to load vendor directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce/fetch vendors on filter change
    fetchVendors();
  }, [search, category, status, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteClick = (vendor, e) => {
    e.stopPropagation();
    setVendorToDelete(vendor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;
    try {
      await vendorService.delete(vendorToDelete.id);
      setToast({ message: `Vendor "${vendorToDelete.name}" deleted successfully.`, type: 'success' });
      fetchVendors();
    } catch (err) {
      console.error("Delete vendor error:", err);
      setToast({ message: "Failed to delete vendor.", type: 'error' });
    } finally {
      setIsDeleteModalOpen(false);
      setVendorToDelete(null);
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

      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Vendor Directory</h1>
          <p className="text-sm text-gray-400">Onboard, edit, and review supplier performance indexes</p>
        </div>
        <button
          onClick={() => navigate('/vendors/new')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-bold text-white shadow-lg shadow-purple-900/20 hover:shadow-purple-500/10 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 glass-panel rounded-xl">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search name, city, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg glass-input text-sm text-white"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg glass-input text-sm text-white appearance-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg glass-input text-sm text-white appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Warning">Warning</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>
        </div>

        {/* Clear Filters Helper */}
        <button
          onClick={() => {
            setSearch('');
            setCategory('');
            setStatus('');
            setSortBy('name');
            setSortOrder('asc');
          }}
          className="px-4 py-2 text-sm font-semibold rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
        >
          Reset Filters
        </button>
      </div>

      {/* Directory Table Grid */}
      <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
        {loading ? (
          <LoadingSpinner message="Querying supplier directory..." />
        ) : error ? (
          <div className="p-8 text-center text-red-400 font-semibold">{error}</div>
        ) : vendors.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-semibold uppercase tracking-wider">
            No matching vendors found in directory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 bg-white/5">
                  <th 
                    onClick={() => handleSort('name')}
                    className="p-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Vendor Name</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th>Category</th>
                  <th>Contact Details</th>
                  <th>Location</th>
                  <th 
                    onClick={() => handleSort('averageScore')}
                    className="p-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Avg Score</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th>Status</th>
                  <th 
                    onClick={() => handleSort('totalEvents')}
                    className="p-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Events</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr 
                    key={v.id} 
                    onClick={() => navigate(`/vendors/${v.id}`)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer text-sm font-medium transition-colors"
                  >
                    {/* Name */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-base">{v.name}</span>
                        {v.businessId && <span className="text-[10px] text-gray-500 font-bold uppercase">{v.businessId}</span>}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
                        {v.category}
                      </span>
                    </td>

                    {/* Contact details */}
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5 text-xs text-gray-300">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-500" />
                          <span>{v.contactPerson}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span>{v.phone}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-400">{v.email}</span>
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-4 text-gray-300 text-xs">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        <span>{v.location}</span>
                      </span>
                    </td>

                    {/* Score */}
                    <td className="p-4">
                      <ScoreBadge score={v.averageScore} showPercentage={true} />
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <StatusBadge status={v.status} />
                    </td>

                    {/* Events Count */}
                    <td className="p-4 text-gray-300 text-center font-bold">
                      {v.totalEvents}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/vendors/${v.id}`)}
                          title="View Profile"
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/vendors/${v.id}/edit`)}
                          title="Edit Vendor"
                          className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(v, e)}
                          title="Delete Vendor"
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Vendor Profile?"
        message={`Are you sure you want to delete vendor "${vendorToDelete?.name}"? This operation will remove all associated ratings and records, and cannot be undone.`}
        confirmText="Delete Vendor"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setVendorToDelete(null);
        }}
        isDangerous={true}
      />
    </div>
  );
}
