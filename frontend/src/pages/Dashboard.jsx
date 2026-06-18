import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  dashboardService
} from '../services/api.js';
import StatCard from '../components/StatCard.jsx';
import ScoreBadge from '../components/ScoreBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  Users,
  ShieldAlert,
  Sparkles,
  CalendarCheck,
  FileEdit,
  TrendingUp,
  ArrowUpRight,
  Clock,
  UserCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const toArray = (value) => {
  return Array.isArray(value) ? value : [];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getSummary();
        setData(res);
        setError('');
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Assembling dashboard metrics..." />;
  if (error) return <div className="p-8 text-center text-red-400 font-semibold">{error}</div>;
  if (!data) return null;

  const defaultKpis = {
    totalVendors: 0,
    activeVendors: 0,
    warningVendors: 0,
    blacklistedVendors: 0,
    averageVendorScore: 0,
    totalEventsRated: 0,
    pendingReviewsCount: 0,
  };

  const defaultCharts = {
    scoreDistribution: [],
    categoryPerformance: [],
    monthlyRatingActivity: [],
  };

  const {
    kpis = defaultKpis,
    charts = defaultCharts,
    topPerforming = [],
    atRisk = [],
    recentlyRated = [],
    latestAlerts = [],
  } = data || {};

  const safeCharts = {
    scoreDistribution: Array.isArray(charts?.scoreDistribution)
      ? charts.scoreDistribution
      : [],
    categoryPerformance: Array.isArray(charts?.categoryPerformance)
      ? charts.categoryPerformance
      : [],
    monthlyRatingActivity: Array.isArray(charts?.monthlyRatingActivity)
      ? charts.monthlyRatingActivity
      : [],
  };

  const safeTopPerforming = Array.isArray(topPerforming) ? topPerforming : [];
  const safeAtRisk = Array.isArray(atRisk) ? atRisk : [];
  const safeRecentlyRated = Array.isArray(recentlyRated) ? recentlyRated : [];
  const safeLatestAlerts = Array.isArray(latestAlerts) ? latestAlerts : [];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Vendors"
          value={kpis?.totalVendors ?? 0}
          icon={<Users className="w-5 h-5" />}
          subtext="Onboarded suppliers"
          trend={`${kpis?.activeVendors ?? 0} Active`}
          trendType="up"
          onClick={() => navigate('/vendors')}
        />
        <StatCard
          title="Average Score"
          value={`${kpis?.averageVendorScore ?? 0} / 5`}
          icon={<TrendingUp className="w-5 h-5" />}
          subtext="SLV System Average"
          trend={`${Math.round(((kpis?.averageVendorScore ?? 0) / 5) * 100)}% Rating`}
          trendType="neutral"
        />
        <StatCard
          title="Warning / Risky"
          value={kpis?.warningVendors ?? 0}
          icon={<ShieldAlert className="w-5 h-5 text-orange-400" />}
          subtext="Need monitoring"
          trend="Action required"
          trendType="down"
          onClick={() => navigate('/blacklist')}
        />
        <StatCard
          title="Blacklisted"
          value={kpis.blacklistedVendors}
          icon={<ShieldAlert className="w-5 h-5 text-red-500" />}
          subtext="Unusable partners"
          trend="Automatic flag active"
          trendType="down"
          onClick={() => navigate('/blacklist')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Rated Events"
          value={kpis?.totalEventsRated ?? 0}
          icon={<CalendarCheck className="w-5 h-5" />}
          subtext="Event histories completed"
        />
        <StatCard
          title="Pending Reviews"
          value={kpis?.pendingReviewsCount ?? 0}
          icon={<FileEdit className="w-5 h-5" />}
          subtext="Reviews awaiting detail"
          trend="Draft submissions"
          onClick={() => navigate('/ratings/new')}
        />
        <div className="glass-card p-5 rounded-xl flex items-center justify-between bg-gradient-to-r from-purple-900/40 to-pink-900/20 border-purple-500/20">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Need Recommendations?</h4>
            <p className="text-xs text-gray-400 mt-1">Match high-quality vendors to new event types instantly.</p>
            <button
              onClick={() => navigate('/recommendations')}
              className="mt-3 flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-white transition-colors"
            >
              <span>Launch Wizard</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <Sparkles className="w-8 h-8 text-purple-400 animate-pulse ml-4" />
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Rating Activity (2/3 width) */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-2 flex flex-col h-80">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Monthly Rating Activity</span>
          </h3>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={safeCharts.monthlyRatingActivity}>
                <defs>
                  <linearGradient id="colorRatings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 16, 26, 0.95)', borderColor: 'rgba(255,255,255,0.1)' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="ratings" stroke="#c084fc" strokeWidth={2} fillOpacity={1} fill="url(#colorRatings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution (1/3 width) */}
        <div className="glass-panel p-6 rounded-xl flex flex-col h-80">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-pink-400" />
            <span>Score Distribution</span>
          </h3>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeCharts.scoreDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {safeCharts.scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 16, 26, 0.95)', borderColor: 'rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-gray-400 font-semibold">
            {safeCharts.scoreDistribution.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                <span className="truncate">{entry.name} ({entry.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance (Full width) */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-3 flex flex-col h-72">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Performance by Category (Average Score)</span>
          </h3>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeCharts.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} domain={[0, 5]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 16, 26, 0.95)', borderColor: 'rgba(255,255,255,0.1)' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Bar dataKey="averageScore" fill="#a78bfa" radius={[4, 4, 0, 0]}>
                  {safeCharts.categoryPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.averageScore >= 4.0 ? '#22c55e' : entry.averageScore >= 3.2 ? '#c084fc' : entry.averageScore >= 2.5 ? '#f97316' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Side-by-side Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Performing Vendors */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h3 className="text-md font-bold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span>Top Performing Vendors</span>
            </span>
            <button onClick={() => navigate('/vendors')} className="text-xs text-purple-400 hover:text-white transition-colors">
              View All
            </button>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-400">
                  <th className="py-2.5">Vendor Name</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5 text-right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {safeTopPerforming.map(v => (
                  <tr
                    key={v.id}
                    onClick={() => navigate(`/vendors/${v.id}`)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer text-sm font-medium transition-colors"
                  >
                    <td className="py-3 text-white">{v.name}</td>
                    <td className="py-3 text-gray-400">{v.category}</td>
                    <td className="py-3 text-right">
                      <ScoreBadge score={v.averageScore} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendors at Risk */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h3 className="text-md font-bold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <span>Vendors at Risk / Blacklisted</span>
            </span>
            <button onClick={() => navigate('/blacklist')} className="text-xs text-purple-400 hover:text-white transition-colors">
              Manage
            </button>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-400">
                  <th className="py-2.5">Vendor</th>
                  <th className="py-2.5">Risk Status</th>
                  <th className="py-2.5 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {safeAtRisk.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-xs text-gray-500 font-semibold uppercase">
                      No vendors currently flagged at risk.
                    </td>
                  </tr>
                ) : (
                  safeAtRisk.map(v => (
                    <tr
                      key={v.id}
                      onClick={() => navigate(`/vendors/${v.id}`)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer text-sm font-medium transition-colors"
                    >
                      <td className="py-3 text-white flex flex-col">
                        <span>{v.name}</span>
                        <span className="text-[10px] text-gray-500">{v.category}</span>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="py-3 text-right">
                        <ScoreBadge score={v.averageScore} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Rated Events (Full width) */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-2 flex flex-col">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-purple-400" />
            <span>Recently Rated Events</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-400">
                  <th className="py-3">Event Details</th>
                  <th className="py-3">Vendor Partners</th>
                  <th className="py-3">Client</th>
                  <th className="py-3">Punctuality / Quality</th>
                  <th className="py-3">Final Score</th>
                  <th className="py-3">Rebook?</th>
                </tr>
              </thead>
              <tbody>
                {safeRecentlyRated.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{r.eventName}</span>
                        <span className="text-[11px] text-gray-500">{r.eventType} • {formatDate(r.eventDate)}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{r.vendor.name}</span>
                        <span className="text-[11px] text-gray-400">{r.vendor.category}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-300">{r.clientName}</td>
                    <td className="py-3 text-gray-400 text-xs">
                      P: <span className="text-white font-medium mr-2">{r.punctuality}/5</span>
                      Q: <span className="text-white font-medium">{r.quality}/5</span>
                    </td>
                    <td className="py-3">
                      <ScoreBadge score={r.finalScore} size="sm" showPercentage />
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.wouldRebook ? 'text-green-400 bg-green-950/20' : 'text-red-400 bg-red-950/20'}`}>
                        {r.wouldRebook ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Blacklist Alerts */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-2 flex flex-col">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-pink-400" />
            <span>Latest Status Logs & Blacklist Alerts</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-400">
                  <th className="py-3">Vendor</th>
                  <th className="py-3">Transition</th>
                  <th className="py-3">Reason</th>
                  <th className="py-3">Triggered By</th>
                  <th className="py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {latestAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-xs text-gray-500 font-semibold uppercase">
                      No status alerts logged. All vendors stable.
                    </td>
                  </tr>
                ) : (
                  safeLatestAlerts.map(alert => (
                    <tr key={alert.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{alert.vendor.name}</span>
                          <span className="text-[11px] text-gray-500">{alert.vendor.category}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <StatusBadge status={alert.oldStatus} />
                          <span className="text-gray-500">➜</span>
                          <StatusBadge status={alert.newStatus} />
                        </div>
                      </td>
                      <td className="py-3 text-gray-300 text-xs max-w-xs truncate" title={alert.reason}>
                        {alert.reason}
                      </td>
                      <td className="py-3 text-gray-400 font-semibold text-xs">{alert.changedBy}</td>
                      <td className="py-3 text-gray-500 text-xs">{formatDate(alert.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


