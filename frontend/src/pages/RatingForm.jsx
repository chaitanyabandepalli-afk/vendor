import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorService, ratingService } from '../services/api.js';
import Toast from '../components/Toast.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Star, ShieldAlert, Calendar, CheckSquare, Save } from 'lucide-react';

const EVENT_TYPES = [
  "Wedding", "Birthday", "Corporate Event", "Engagement", 
  "Reception", "Cultural Event", "Other"
];

const ISSUES_LIST = [
  "Late arrival",
  "Poor quality",
  "Rude behavior",
  "Overcharged",
  "Last-minute cancellation",
  "Poor communication",
  "Damaged items",
  "Client complaint"
];

export default function RatingForm({ activeRole }) {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [vendorId, setVendorId] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventType, setEventType] = useState('');
  const [clientName, setClientName] = useState('');
  const [venue, setVenue] = useState('');
  const [ratedBy, setRatedBy] = useState(activeRole || 'Event Planner');
  
  // Rating values (1 to 5)
  const [punctuality, setPunctuality] = useState(5);
  const [quality, setQuality] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [costBehavior, setCostBehavior] = useState(5);
  const [communication, setCommunication] = useState(5);

  const [wouldRebook, setWouldRebook] = useState('Yes');
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        // Load all vendors to allow selection
        const data = await vendorService.getAll();
        setVendors(data);
      } catch (err) {
        console.error("Load vendors error:", err);
        setToast({ message: "Failed to load vendors list.", type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  // Update category when vendor selection changes
  const handleVendorChange = (e) => {
    const vId = e.target.value;
    setVendorId(vId);
    const vendor = vendors.find(v => v.id === vId);
    setSelectedVendor(vendor || null);
  };

  const handleIssueCheckbox = (issue) => {
    if (selectedIssues.includes(issue)) {
      setSelectedIssues(selectedIssues.filter(i => i !== issue));
    } else {
      setSelectedIssues([...selectedIssues, issue]);
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!vendorId) tempErrors.vendorId = "Please select a vendor";
    if (!eventName.trim()) tempErrors.eventName = "Event name is required";
    if (!eventDate) tempErrors.eventDate = "Event date is required";
    if (!eventType) tempErrors.eventType = "Please select an event type";
    if (!clientName.trim()) tempErrors.clientName = "Client name is required";
    if (!venue.trim()) tempErrors.venue = "Venue location is required";
    if (!ratedBy.trim()) tempErrors.ratedBy = "Rater identity is required";
    if (!feedback.trim()) tempErrors.feedback = "Performance feedback is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        vendorId,
        eventName,
        eventDate,
        eventType,
        clientName,
        venue,
        ratedBy,
        punctuality: parseInt(punctuality),
        quality: parseInt(quality),
        professionalism: parseInt(professionalism),
        costBehavior: parseInt(costBehavior),
        communication: parseInt(communication),
        wouldRebook: wouldRebook === 'Yes',
        issues: selectedIssues.join(', '),
        feedback,
        adminNotes
      };

      const res = await ratingService.create(payload);
      setToast({ message: "Rating submitted successfully! Vendor scores recalculated.", type: 'success' });
      
      setTimeout(() => {
        // Navigate to vendor's detail page
        navigate(`/vendors/${vendorId}`);
      }, 1500);

    } catch (err) {
      console.error("Submit rating error:", err);
      setToast({ message: "Failed to submit vendor rating.", type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Pre-loading event rating details..." />;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-white">Event Performance Rating</h1>
        <p className="text-sm text-gray-400">Evaluate vendor performance following an event completion to automatically refresh quality scores</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Module 1: Event Context */}
        <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Event Context & Booking Info</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Vendor Select */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Select Vendor *</label>
              <select
                value={vendorId}
                onChange={handleVendorChange}
                className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white appearance-none ${errors.vendorId ? 'border-red-500/50 focus:border-red-500' : ''}`}
              >
                <option value="">Choose Supplier...</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.category}) - {v.status}
                  </option>
                ))}
              </select>
              {errors.vendorId && <span className="text-[11px] text-red-400 font-semibold">{errors.vendorId}</span>}
              
              {selectedVendor && selectedVendor.status === 'Blacklisted' && (
                <div className="p-3 text-xs font-semibold text-red-200 bg-red-950/40 border border-red-500/20 rounded-lg flex items-center gap-2 mt-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>WARNING: This vendor is blacklisted: {selectedVendor.blacklistReason || 'Poor performance history'}</span>
                </div>
              )}
            </div>

            {/* Event Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Event Name *</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Kapoor Reception Gala"
                className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white ${errors.eventName ? 'border-red-500/50 focus:border-red-500' : ''}`}
              />
              {errors.eventName && <span className="text-[11px] text-red-400 font-semibold">{errors.eventName}</span>}
            </div>

            {/* Event Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Event Date *</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white ${errors.eventDate ? 'border-red-500/50 focus:border-red-500' : ''}`}
              />
              {errors.eventDate && <span className="text-[11px] text-red-400 font-semibold">{errors.eventDate}</span>}
            </div>

            {/* Event Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Event Type *</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white appearance-none ${errors.eventType ? 'border-red-500/50 focus:border-red-500' : ''}`}
              >
                <option value="">Select Type...</option>
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.eventType && <span className="text-[11px] text-red-400 font-semibold">{errors.eventType}</span>}
            </div>

            {/* Client Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Client Name *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Mrs. Kapoor"
                className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white ${errors.clientName ? 'border-red-500/50 focus:border-red-500' : ''}`}
              />
              {errors.clientName && <span className="text-[11px] text-red-400 font-semibold">{errors.clientName}</span>}
            </div>

            {/* Venue Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Venue Venue/Location *</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Palace Grounds Garden Hall"
                className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white ${errors.venue ? 'border-red-500/50 focus:border-red-500' : ''}`}
              />
              {errors.venue && <span className="text-[11px] text-red-400 font-semibold">{errors.venue}</span>}
            </div>

            {/* Rated By */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Rated By *</label>
              <input
                type="text"
                value={ratedBy}
                onChange={(e) => setRatedBy(e.target.value)}
                placeholder="Planner / Coordinator name"
                className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white ${errors.ratedBy ? 'border-red-500/50 focus:border-red-500' : ''}`}
              />
              {errors.ratedBy && <span className="text-[11px] text-red-400 font-semibold">{errors.ratedBy}</span>}
            </div>
          </div>
        </div>

        {/* Module 2: Performance Evaluation Sliders */}
        <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>Vendor Score Performance Metrics</span>
          </h3>

          <div className="space-y-5">
            {[
              { label: 'Punctuality', val: punctuality, setVal: setPunctuality, desc: 'On-time arrival, stage construction speed, load-out compliance' },
              { label: 'Quality', val: quality, setVal: setQuality, desc: 'Service execution, item aesthetic/taste, premium material delivery' },
              { label: 'Professionalism', val: professionalism, setVal: setProfessionalism, desc: 'Staff grooming, politeness, flexibility under pressure' },
              { label: 'Cost Behavior', val: costBehavior, setVal: setCostBehavior, desc: 'Billing transparency, no last-minute charge updates' },
              { label: 'Communication', val: communication, setVal: setCommunication, desc: 'Response speeds, cooperativeness, liaison capability' }
            ].map(metric => (
              <div key={metric.label} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1">
                  <span className="text-sm font-bold text-white block">{metric.label}</span>
                  <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">{metric.desc}</span>
                </div>
                <div className="md:col-span-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={metric.val}
                    onChange={(e) => metric.setVal(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                <div className="md:col-span-1 text-right md:text-center">
                  <span className="inline-flex items-center px-3 py-1 bg-purple-500/10 text-purple-300 font-extrabold text-sm border border-purple-500/20 rounded-lg">
                    {metric.val} ★
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 3: Issues and Additional Feedback */}
        <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <CheckSquare className="w-4 h-4 text-pink-400" />
            <span>Risk Flags & Service Issues</span>
          </h3>

          <div className="space-y-6">
            {/* Issues Checkbox */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Identify Issues Faced</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {ISSUES_LIST.map(issue => {
                  const isChecked = selectedIssues.includes(issue);
                  return (
                    <label 
                      key={issue}
                      onClick={() => handleIssueCheckbox(issue)}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all ${
                        isChecked 
                          ? 'bg-red-500/10 text-red-300 border-red-500/40 glow-red' 
                          : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => {}} // Controlled by label click
                        className="hidden"
                      />
                      <span>{issue}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Rebook radio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Would you rebook this supplier?</label>
              <div className="flex gap-4">
                {['Yes', 'No'].map(opt => (
                  <label 
                    key={opt}
                    onClick={() => setWouldRebook(opt)}
                    className={`px-5 py-2 rounded-lg border text-sm font-bold cursor-pointer transition-all ${
                      wouldRebook === opt 
                        ? opt === 'Yes' 
                          ? 'bg-green-500/10 text-green-300 border-green-500/40' 
                          : 'bg-red-500/10 text-red-300 border-red-500/40'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="rebook" 
                      value={opt} 
                      checked={wouldRebook === opt}
                      onChange={() => {}}
                      className="hidden"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Written feedback */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Performance Feedback *</label>
              <textarea
                rows="3"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe specific strengths or weaknesses of the vendor during the event execution..."
                className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white resize-none ${errors.feedback ? 'border-red-500/50 focus:border-red-500' : ''}`}
              />
              {errors.feedback && <span className="text-[11px] text-red-400 font-semibold">{errors.feedback}</span>}
            </div>

            {/* Admin notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Admin/Scoring Notes (Optional)</label>
              <textarea
                rows="2"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes regarding warnings, pricing disputes, or contract adjustments..."
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-extrabold text-white shadow-lg shadow-purple-950/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
          >
            <Save className="w-5 h-5" />
            <span>{submitting ? 'Recalculating Scores...' : 'Submit Evaluation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
