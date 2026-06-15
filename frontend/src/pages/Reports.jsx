import React, { useEffect, useState } from 'react';
import { reportService } from '../services/api.js';
import ScoreBadge from '../components/ScoreBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Calendar, 
  Layers, 
  UserX 
} from 'lucide-react';

const REPORT_TYPES = [
  { id: 'vendor-summary', label: 'Vendor Performance Summary', icon: <FileText className="w-4 h-4" /> },
  { id: 'category-performance', label: 'Category-wise Vendor Comparison', icon: <Layers className="w-4 h-4" /> },
  { id: 'event-ratings', label: 'Event-wise Vendor Rating Report', icon: <Calendar className="w-4 h-4" /> },
  { id: 'blacklist-report', label: 'Flagged & Blacklisted Vendor Report', icon: <UserX className="w-4 h-4" /> }
];

export default function Reports() {
  const [activeReport, setActiveReport] = useState('vendor-summary');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [error, setError] = useState('');

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data = [];
      if (activeReport === 'vendor-summary') {
        data = await reportService.getVendorSummary();
      } else if (activeReport === 'category-performance') {
        data = await reportService.getCategoryPerformance();
      } else if (activeReport === 'event-ratings') {
        data = await reportService.getEventRatings();
      } else if (activeReport === 'blacklist-report') {
        const fullSummary = await reportService.getVendorSummary();
        data = fullSummary.filter(v => v.status === 'Warning' || v.status === 'Blacklisted');
      }
      
      setReportData(data);
    } catch (err) {
      console.error("Fetch report error:", err);
      setError("Failed to generate report details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeReport]);

  const handleExportCSV = () => {
    if (reportData.length === 0) return;

    // Build CSV Headers and Rows depending on selected report type
    let headers = [];
    let rows = [];

    if (activeReport === 'vendor-summary' || activeReport === 'blacklist-report') {
      headers = ['Vendor Name', 'Category', 'Location', 'Status', 'Risk Level', 'Avg Score', 'Score %', 'Total Events', 'Severe Issues', 'No Rebook Count', 'Rebook %', 'Contact Email', 'Phone'];
      rows = reportData.map(v => [
        `"${v.name}"`,
        `"${v.category}"`,
        `"${v.location}"`,
        v.status,
        v.riskLevel,
        v.averageScore,
        v.scorePercentage,
        v.totalEvents,
        v.severeIssueCount,
        v.noRebookCount,
        v.rebookPercentage,
        v.email,
        v.phone
      ]);
    } else if (activeReport === 'category-performance') {
      headers = ['Category Name', 'Total Vendors', 'Avg Score', 'Score %', 'Total Ratings Count'];
      rows = reportData.map(c => [
        `"${c.category}"`,
        c.vendorCount,
        c.averageScore,
        c.scorePercentage,
        c.totalRatings
      ]);
    } else if (activeReport === 'event-ratings') {
      headers = ['Event Name', 'Event Date', 'Event Type', 'Client Name', 'Venue', 'Vendor Name', 'Vendor Category', 'Rated By', 'Punctuality', 'Quality', 'Professionalism', 'Cost Behavior', 'Communication', 'Final Score', 'Score %', 'Would Rebook', 'Issues faced', 'Feedback'];
      rows = reportData.map(r => [
        `"${r.eventName}"`,
        new Date(r.eventDate).toLocaleDateString(),
        r.eventType,
        `"${r.clientName}"`,
        `"${r.venue}"`,
        `"${r.vendorName}"`,
        `"${r.vendorCategory}"`,
        `"${r.ratedBy}"`,
        r.punctuality,
        r.quality,
        r.professionalism,
        r.costBehavior,
        r.communication,
        r.finalScore,
        r.scorePercentage,
        r.wouldRebook,
        `"${r.issues}"`,
        `"${r.feedback.replace(/"/g, '""')}"`
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    // Trigger download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SLV_Events_Report_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Analytics & Auditing Reports</h1>
          <p className="text-sm text-gray-400">Generate, audit, and export performance datasets for management review</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={loading || reportData.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-bold text-white shadow-lg disabled:opacity-50 disabled:pointer-events-none transition-all hover:scale-[1.02]"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map(report => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-bold transition-all text-left ${
              activeReport === report.id
                ? 'glass-panel border-purple-500/50 text-purple-300 shadow-md bg-gradient-to-r from-purple-500/10 to-transparent'
                : 'glass-card border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
            }`}
          >
            <span className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
              {report.icon}
            </span>
            <span>{report.label}</span>
          </button>
        ))}
      </div>

      {/* Report Tables Card */}
      <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
        {loading ? (
          <LoadingSpinner message="Calculating dynamic analytical matrices..." />
        ) : error ? (
          <div className="p-8 text-center text-red-400 font-semibold">{error}</div>
        ) : reportData.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-semibold uppercase tracking-wider">
            No dataset records available for this report type.
          </div>
        ) : (
          <div className="overflow-x-auto">
            
            {/* Table A: Vendor Summary / Blacklist Report */}
            {(activeReport === 'vendor-summary' || activeReport === 'blacklist-report') && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 bg-white/5">
                    <th className="p-4">Vendor Name</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Risk</th>
                    <th>Avg Score</th>
                    <th>Events</th>
                    <th>Severe Issues</th>
                    <th>Rebook %</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map(v => (
                    <tr key={v.vendorId} className="border-b border-white/5 hover:bg-white/5 text-sm transition-all font-medium">
                      <td className="p-4 text-white font-bold">{v.name}</td>
                      <td>{v.category}</td>
                      <td>{v.location}</td>
                      <td><StatusBadge status={v.status} /></td>
                      <td>
                        <span className={`text-xs font-bold uppercase ${
                          v.riskLevel === 'High' ? 'text-red-400' : v.riskLevel === 'Medium' ? 'text-orange-400' : 'text-green-400'
                        }`}>{v.riskLevel}</span>
                      </td>
                      <td><ScoreBadge score={v.averageScore} size="sm" showPercentage /></td>
                      <td className="font-bold text-white pl-4">{v.totalEvents}</td>
                      <td className={`pl-8 font-bold ${v.severeIssueCount > 0 ? 'text-orange-400' : 'text-gray-400'}`}>{v.severeIssueCount}</td>
                      <td className="font-bold text-white">{v.rebookPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Table B: Category Performance */}
            {activeReport === 'category-performance' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 bg-white/5">
                    <th className="p-4">Category Name</th>
                    <th>Total Vendors</th>
                    <th>Average Rating Index</th>
                    <th>Score percentage</th>
                    <th>Total ratings count</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map(c => (
                    <tr key={c.category} className="border-b border-white/5 hover:bg-white/5 text-sm transition-all font-medium">
                      <td className="p-4 text-white font-bold">{c.category}</td>
                      <td className="font-bold text-white pl-6">{c.vendorCount}</td>
                      <td><ScoreBadge score={c.averageScore} size="sm" /></td>
                      <td className="text-purple-300 font-bold">{c.scorePercentage}%</td>
                      <td className="font-bold text-white pl-8">{c.totalRatings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Table C: Event Ratings report */}
            {activeReport === 'event-ratings' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 bg-white/5">
                    <th className="p-4">Event details</th>
                    <th>Vendor details</th>
                    <th>Client</th>
                    <th>Punctuality / Quality</th>
                    <th>Final Score</th>
                    <th>Rebook?</th>
                    <th>Issues Raised</th>
                    <th>Feedback comments</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map(r => (
                    <tr key={r.ratingId} className="border-b border-white/5 hover:bg-white/5 transition-all align-top">
                      <td className="p-4">
                        <div className="flex flex-col font-medium">
                          <span className="font-bold text-white text-sm">{r.eventName}</span>
                          <span className="text-gray-400">{r.eventType} • {new Date(r.eventDate).toLocaleDateString()}</span>
                          <span className="text-gray-500 mt-1">{r.venue}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col font-medium">
                          <span className="font-bold text-white">{r.vendorName}</span>
                          <span className="text-gray-400">{r.vendorCategory}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{r.clientName}</td>
                      <td className="p-4 text-gray-400">
                        P: <span className="text-white font-medium mr-2">{r.punctuality}/5</span>
                        Q: <span className="text-white font-medium">{r.quality}/5</span>
                      </td>
                      <td className="p-4">
                        <ScoreBadge score={r.finalScore} size="sm" showPercentage />
                      </td>
                      <td className="p-4">
                        <span className={`font-bold px-2 py-0.5 rounded ${r.wouldRebook === 'Yes' ? 'text-green-400 bg-green-950/20' : 'text-red-400 bg-red-950/20'}`}>
                          {r.wouldRebook}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs truncate" title={r.issues}>{r.issues}</td>
                      <td className="p-4 max-w-xs break-words italic text-gray-400">"{r.feedback}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
