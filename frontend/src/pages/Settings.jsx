import React, { useEffect, useState } from 'react';
import { settingsService } from '../services/api.js';
import Toast from '../components/Toast.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  Scale,
  ShieldCheck
} from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState([]);
  
  // Weight & Threshold form values
  const [blacklistThreshold, setBlacklistThreshold] = useState(2.5);
  const [warningThreshold, setWarningThreshold] = useState(3.2);

  const [wPunctuality, setWPunctuality] = useState(0.25);
  const [wQuality, setWQuality] = useState(0.25);
  const [wProfessionalism, setWProfessionalism] = useState(0.20);
  const [wCostBehavior, setWCostBehavior] = useState(0.15);
  const [wCommunication, setWCommunication] = useState(0.15);

  const [triggerRecalculate, setTriggerRecalculate] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAll();
      setSettings(data);

      // Map values
      data.forEach(s => {
        const val = parseFloat(s.value);
        if (s.id === 'blacklist_threshold') setBlacklistThreshold(val);
        if (s.id === 'warning_threshold') setWarningThreshold(val);
        if (s.id === 'weight_punctuality') setWPunctuality(val);
        if (s.id === 'weight_quality') setWQuality(val);
        if (s.id === 'weight_professionalism') setWProfessionalism(val);
        if (s.id === 'weight_cost_behavior') setWCostBehavior(val);
        if (s.id === 'weight_communication') setWCommunication(val);
      });
    } catch (err) {
      console.error("Load settings error:", err);
      setToast({ message: "Failed to load scoring configurations.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Check sum of weights
  const weightsSum = parseFloat((wPunctuality + wQuality + wProfessionalism + wCostBehavior + wCommunication).toFixed(2));
  const isSumValid = weightsSum === 1.0;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isSumValid) {
      setToast({ message: `Weights must sum to exactly 1.0 (Current: ${weightsSum})`, type: 'error' });
      return;
    }

    try {
      setSaving(true);
      const payload = [
        { id: 'blacklist_threshold', value: String(blacklistThreshold) },
        { id: 'warning_threshold', value: String(warningThreshold) },
        { id: 'weight_punctuality', value: String(wPunctuality) },
        { id: 'weight_quality', value: String(wQuality) },
        { id: 'weight_professionalism', value: String(wProfessionalism) },
        { id: 'weight_cost_behavior', value: String(wCostBehavior) },
        { id: 'weight_communication', value: String(wCommunication) }
      ];

      const res = await settingsService.update(payload, triggerRecalculate);
      setToast({ 
        message: res.recalculated 
          ? "Settings saved! Recalculated all vendor scores successfully." 
          : "Settings updated successfully.", 
        type: 'success' 
      });
      fetchSettings();
    } catch (err) {
      console.error("Save settings error:", err);
      setToast({ message: "Failed to update configurations.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Querying scoring parameters..." />;

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto animate-fade-in">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">System Scoring Configurations</h1>
        <p className="text-sm text-gray-400">Manage mathematical weights and warning/blacklist limits dynamically</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Module A: Threshold settings */}
        <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>Standing Status Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Warning limit */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-gray-300 uppercase tracking-wider">Warning Threshold</label>
                <span className="font-bold text-orange-400">{warningThreshold} ★</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="4.0"
                step="0.1"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="text-[10px] text-gray-500 leading-tight block">Scores between Blacklist limit and this value trigger warnings.</span>
            </div>

            {/* Blacklist limit */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-gray-300 uppercase tracking-wider">Blacklist Threshold</label>
                <span className="font-bold text-red-400">{blacklistThreshold} ★</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={blacklistThreshold}
                onChange={(e) => setBlacklistThreshold(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <span className="text-[10px] text-gray-500 leading-tight block">Scores falling below this value trigger automatic blacklisting.</span>
            </div>

          </div>
        </div>

        {/* Module B: Weights */}
        <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-wrap gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              <span>Weighted Formula Weights</span>
            </h3>
            
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span>Weights Total:</span>
              <span className={`px-2.5 py-1 rounded font-extrabold border ${
                isSumValid 
                  ? 'bg-green-500/10 text-green-300 border-green-500/20' 
                  : 'bg-red-500/10 text-red-300 border-red-500/20'
              }`}>
                {weightsSum} / 1.0
              </span>
            </div>
          </div>

          {!isSumValid && (
            <div className="p-3 text-xs font-semibold text-red-200 bg-red-950/40 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Warning: The formula requires all weights to sum to exactly 1.0 before saving is permitted.</span>
            </div>
          )}

          <div className="space-y-5">
            {[
              { label: 'Punctuality Weight', val: wPunctuality, setVal: setWPunctuality, color: 'accent-purple-500' },
              { label: 'Quality Weight', val: wQuality, setVal: setWQuality, color: 'accent-purple-500' },
              { label: 'Professionalism Weight', val: wProfessionalism, setVal: setWProfessionalism, color: 'accent-purple-500' },
              { label: 'Cost Behavior Weight', val: wCostBehavior, setVal: setWCostBehavior, color: 'accent-purple-500' },
              { label: 'Communication Weight', val: wCommunication, setVal: setWCommunication, color: 'accent-purple-500' }
            ].map(w => (
              <div key={w.label} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1">
                  <span className="text-sm font-bold text-white block">{w.label}</span>
                </div>
                <div className="md:col-span-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="0.0"
                    max="0.5"
                    step="0.05"
                    value={w.val}
                    onChange={(e) => w.setVal(parseFloat(e.target.value))}
                    className={`w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer ${w.color}`}
                  />
                </div>
                <div className="md:col-span-1 text-right md:text-center">
                  <span className="inline-flex items-center px-3 py-1 bg-white/5 text-gray-300 font-extrabold text-sm border border-white/10 rounded-lg">
                    {Math.round(w.val * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recalculate Checklist & Save */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-3 cursor-pointer select-none text-xs sm:text-sm text-gray-300 font-semibold">
            <input
              type="checkbox"
              checked={triggerRecalculate}
              onChange={(e) => setTriggerRecalculate(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 bg-white/5 accent-purple-500 text-purple-600 focus:ring-0 cursor-pointer"
            />
            <span className="flex flex-col">
              <span className="text-white font-bold">Recalculate Existing Scores</span>
              <span className="text-[10px] text-gray-500 font-semibold leading-none mt-1">Check to re-compute all historical rating averages using new parameters.</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={saving || !isSumValid}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-extrabold text-white shadow-lg disabled:opacity-50 disabled:pointer-events-none transition-all hover:scale-[1.02]"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configurations</span>
          </button>
        </div>

      </form>
    </div>
  );
}
