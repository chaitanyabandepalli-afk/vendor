import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationService } from '../services/api.js';
import ScoreBadge from '../components/ScoreBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Toast from '../components/Toast.jsx';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CalendarCheck, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  "Caterer", "Decorator", "Photographer", "Videographer", 
  "Sound & DJ", "Lighting", "Venue Partner", "Florist", 
  "Transport", "Logistics", "Makeup Artist", "Other"
];

const EVENT_TYPES = [
  "Wedding", "Birthday", "Corporate Event", "Engagement", 
  "Reception", "Cultural Event", "Other"
];

export default function Recommendations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [toast, setToast] = useState(null);

  // Selector Filter parameters
  const [category, setCategory] = useState('');
  const [eventType, setEventType] = useState('');
  const [minScore, setMinScore] = useState(4.0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!category) {
      setToast({ message: "Please select a vendor category.", type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const params = {
        category,
        minScore,
        eventType
      };
      const data = await recommendationService.get(params);
      setRecommendations(data);
      setSearched(true);
    } catch (err) {
      console.error("Fetch recommendations error:", err);
      setToast({ message: "Failed to load vendor recommendations.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto animate-fade-in">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Vendor Recommendation Wizard</h1>
        <p className="text-sm text-gray-400">Match the best-suited active suppliers based on event categories, historical ratings, and reliability standing</p>
      </div>

      {/* Wizard Selectors Card */}
      <form onSubmit={handleSearch} className="glass-panel p-6 rounded-xl border border-white/10 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Match Event Parameters</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Vendor Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Vendor Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white appearance-none"
            >
              <option value="">Select Category...</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Event Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Planned Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white appearance-none"
            >
              <option value="">Select Event Type...</option>
              {EVENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Minimum Rating Score */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-gray-300 uppercase tracking-wider">Min Quality Rating</label>
              <span className="font-bold text-purple-400">{minScore} ★</span>
            </div>
            <div className="flex items-center gap-4 py-2">
              <input
                type="range"
                min="3.0"
                max="5.0"
                step="0.1"
                value={minScore}
                onChange={(e) => setMinScore(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Find Button */}
        <div className="flex justify-end pt-3 border-t border-white/5">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-extrabold text-white shadow-lg transition-all hover:scale-[1.02]"
          >
            <Search className="w-4 h-4" />
            <span>Search Recommendations</span>
          </button>
        </div>
      </form>

      {/* Recommendations Listings */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSpinner message="Ranking and compiling best matches..." />
        ) : !searched ? (
          <div className="p-8 text-center text-gray-500 rounded-xl border border-dashed border-white/10">
            Select parameters above to view recommended event partners.
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 text-center text-orange-400 font-semibold rounded-xl border border-dashed border-orange-500/20 bg-orange-950/5">
            No active vendors matched your criteria. Try lowering the minimum quality score parameter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((v, index) => {
              const rank = index + 1;
              return (
                <div 
                  key={v.id} 
                  className={`glass-card p-6 rounded-xl border flex flex-col justify-between relative transition-all ${
                    rank === 1 
                      ? 'border-purple-500/50 glow-purple bg-gradient-to-tr from-purple-900/10 to-transparent' 
                      : 'border-white/10'
                  }`}
                >
                  {/* Rank badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {rank === 1 && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-purple-500 text-white text-[9px] font-extrabold uppercase shadow-md animate-pulse">
                        ★ Top Match
                      </span>
                    )}
                    <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-xs font-bold flex items-center justify-center text-gray-400">
                      #{rank}
                    </span>
                  </div>

                  <div>
                    {/* Header */}
                    <div className="pr-16">
                      <h3 className="text-lg font-bold text-white leading-tight">{v.name}</h3>
                      <span className="text-xs text-gray-400 font-semibold">{v.category}</span>
                    </div>

                    {/* Location and Contact */}
                    <div className="mt-4 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        <span>{v.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                        <span>{v.phone}</span>
                      </span>
                    </div>

                    {/* Quality Metric indicators */}
                    <div className="grid grid-cols-2 gap-4 mt-6 p-3 bg-white/5 border border-white/5 rounded-lg text-xs">
                      <div>
                        <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px] block">Average Rating</span>
                        <div className="flex items-center gap-1 mt-1">
                          <ScoreBadge score={v.averageScore} size="sm" showPercentage />
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px] block">Reliability Score</span>
                        <div className="flex items-center gap-1 mt-1.5 font-extrabold text-white text-sm">
                          <ShieldCheck className="w-4 h-4 text-green-400" />
                          <span>{v.reliabilityScore} / 5</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Experience stats */}
                    <div className="mt-4 flex justify-between text-xs text-gray-400 font-medium border-b border-white/5 pb-3">
                      <span className="flex items-center gap-1.5">
                        <CalendarCheck className="w-4 h-4 text-blue-400" />
                        <span>Events: <b>{v.totalEvents}</b></span>
                      </span>
                      {v.eventTypeMatches > 0 && (
                        <span className="text-purple-400">
                          {eventType} Avg: <b>{v.eventTypeAverageScore} ★</b>
                        </span>
                      )}
                      {v.severeIssueCount > 0 && (
                        <span className="flex items-center gap-1 text-orange-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Issues: <b>{v.severeIssueCount}</b></span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Safe to book</span>
                    <button
                      onClick={() => navigate(`/vendors/${v.id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white font-bold transition-all"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
