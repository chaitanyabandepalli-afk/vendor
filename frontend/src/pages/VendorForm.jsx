import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vendorService } from '../services/api.js';
import Toast from '../components/Toast.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

const CATEGORIES = [
  "Caterer", "Decorator", "Photographer", "Videographer", 
  "Sound & DJ", "Lighting", "Venue Partner", "Florist", 
  "Transport", "Logistics", "Makeup Artist", "Other"
];

export default function VendorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Active');
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchVendorData = async () => {
        try {
          setFormLoading(true);
          const data = await vendorService.getById(id);
          setName(data.name);
          setCategory(data.category);
          setContactPerson(data.contactPerson);
          setPhone(data.phone);
          setEmail(data.email);
          setLocation(data.location);
          setBusinessId(data.businessId || '');
          setNotes(data.notes || '');
          setStatus(data.status);
        } catch (err) {
          console.error("Load vendor error:", err);
          setToast({ message: "Failed to load vendor profile.", type: 'error' });
        } finally {
          setFormLoading(false);
        }
      };
      fetchVendorData();
    }
  }, [id, isEditMode]);

  const validate = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = "Vendor name is required";
    if (!category) tempErrors.category = "Category is required";
    if (!contactPerson.trim()) tempErrors.contactPerson = "Contact person is required";
    if (!phone.trim()) tempErrors.phone = "Phone number is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      tempErrors.email = "Email address is required";
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Invalid email format";
    }

    if (!location.trim()) tempErrors.location = "City/location is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        name,
        category,
        contactPerson,
        phone,
        email,
        location,
        businessId: businessId || null,
        notes: notes || null,
        status
      };

      if (isEditMode) {
        await vendorService.update(id, payload);
        setToast({ message: "Vendor profile updated successfully!", type: 'success' });
      } else {
        await vendorService.create(payload);
        setToast({ message: "Vendor onboarded successfully!", type: 'success' });
      }

      // Delay redirect to allow toast read
      setTimeout(() => {
        navigate('/vendors');
      }, 1500);

    } catch (err) {
      console.error("Submit vendor form error:", err);
      setToast({ message: "Failed to save vendor details.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) return <LoadingSpinner message="Retrieving vendor details..." />;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Form Action Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/vendors')}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {isEditMode ? 'Edit Vendor Profile' : 'Onboard New Vendor'}
          </h1>
          <p className="text-sm text-gray-400">
            {isEditMode ? 'Modify supplier information and contact points' : 'Onboard a new supplier to the event ecosystem'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl border border-white/10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Vendor Name */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Vendor/Supplier Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Decorators & Florists"
              className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white ${errors.name ? 'border-red-500/50 focus:border-red-500' : ''}`}
            />
            {errors.name && <span className="text-[11px] text-red-400 font-semibold">{errors.name}</span>}
          </div>

          {/* Category selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white appearance-none ${errors.category ? 'border-red-500/50 focus:border-red-500' : ''}`}
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <span className="text-[11px] text-red-400 font-semibold">{errors.category}</span>}
          </div>

          {/* Contact Person */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Contact Person *</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Vikram Malhotra"
              className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white ${errors.contactPerson ? 'border-red-500/50 focus:border-red-500' : ''}`}
            />
            {errors.contactPerson && <span className="text-[11px] text-red-400 font-semibold">{errors.contactPerson}</span>}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Phone Number *</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white ${errors.phone ? 'border-red-500/50 focus:border-red-500' : ''}`}
            />
            {errors.phone && <span className="text-[11px] text-red-400 font-semibold">{errors.phone}</span>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vikram@royaldecorators.in"
              className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white ${errors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
            />
            {errors.email && <span className="text-[11px] text-red-400 font-semibold">{errors.email}</span>}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">City / Location *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bangalore"
              className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white ${errors.location ? 'border-red-500/50 focus:border-red-500' : ''}`}
            />
            {errors.location && <span className="text-[11px] text-red-400 font-semibold">{errors.location}</span>}
          </div>

          {/* Business GST ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">GSTIN / Business ID (Optional)</label>
            <input
              type="text"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="e.g. 29ROYAL1234A1Z5"
              className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Internal Notes / Specifications</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide context regarding service capabilities, premium items, pricing brackets, etc."
              className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white resize-none"
            />
          </div>

          {/* Status (Only on edit or onboarding) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Initial Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white appearance-none"
            >
              <option value="Active">Active / Safe</option>
              <option value="Warning">Warning / Monitor</option>
              <option value="Blacklisted">Blacklisted / Suspended</option>
            </select>
          </div>
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => navigate('/vendors')}
            className="px-4 py-2.5 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-bold text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
          >
            <Save className="w-4 h-4" />
            <span>{isEditMode ? 'Update Vendor' : 'Onboard Vendor'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
