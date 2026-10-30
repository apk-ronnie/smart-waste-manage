import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  AlertTriangle,
  AlertOctagon,
  Percent,
  RefreshCw,
  Navigation,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Layers,
  Activity,
  HardDrive,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { DashboardLayout } from '../components/DashboardLayout.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { BinData } from '../components/BinCard.tsx';
import { SmartBinVisual } from '../components/visuals/SmartBinVisual.tsx';
import { CampusZoneVisual } from '../components/visuals/CampusZoneVisual.tsx';
import api from '../services/api.ts';

interface AnalyticsData {
  totalBins: number;
  averageFill: number;
  collectionRequiredCount: number;
  overflowRiskCount: number;
  totalNeedingCollection: number;
  fillingCount: number;
  normalCount: number;
}

export const DashboardPage: React.FC = () => {
  const [bins, setBins] = useState<BinData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedPreviewBin, setSelectedPreviewBin] = useState<BinData | null>(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/bins');
      setBins(res.data.bins);
      setAnalytics(res.data.analytics);
      setRecentLogs(res.data.recentLogs || []);
      if (res.data.bins.length > 0 && !selectedPreviewBin) {
        // Select the highest fill bin by default for preview
        const highest = [...res.data.bins].sort((a, b) => b.fill_percentage - a.fill_percentage)[0];
        setSelectedPreviewBin(highest);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleBinsUpdated = () => fetchDashboardData();
    window.addEventListener('bins-updated', handleBinsUpdated);
    return () => window.removeEventListener('bins-updated', handleBinsUpdated);
  }, []);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post('/bins/simulate');
      setBins(res.data.bins);
      setAnalytics(res.data.analytics);
      if (res.data.bins.length > 0) {
        const highest = [...res.data.bins].sort((a: BinData, b: BinData) => b.fill_percentage - a.fill_percentage)[0];
        setSelectedPreviewBin(highest);
      }
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setTimeout(() => setIsSimulating(false), 400);
    }
  };

  const chartData = [
    { name: 'Normal (0-49%)', count: analytics?.normalCount || 0, color: '#10b981' },
    { name: 'Filling (50-79%)', count: analytics?.fillingCount || 0, color: '#eab308' },
    { name: 'Required (80-99%)', count: analytics?.collectionRequiredCount || 0, color: '#f59e0b' },
    { name: 'Overflow (100%)', count: analytics?.overflowRiskCount || 0, color: '#f43f5e' },
  ];

  const urgentBins = bins.filter((b) => b.fill_percentage >= 80);
  const totalVolumeLiters = bins.reduce((acc, b) => acc + Math.round((b.fill_percentage / 100) * 120), 0);

  return (
    <DashboardLayout onSimulate={handleSimulate} isSimulating={isSimulating}>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Facility Waste Monitoring Console
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live IoT optical telemetry, fill levels, and automated route dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              Simulate Telemetry
            </button>
            <button
              onClick={() => navigate('/route-optimization')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold border border-emerald-500/50 transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              Route Planner ({analytics?.totalNeedingCollection || 0})
            </button>
          </div>
        </div>

        {/* Clean Alert Banner if any bin >= 80% */}
        {urgentBins.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-900 border border-amber-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-amber-950/50 text-amber-400 border border-amber-800/50 shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">
                  Collection Required: {urgentBins.length} dustbin(s) flagged
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {analytics?.overflowRiskCount || 0} unit(s) at 100% overflow risk, and {analytics?.collectionRequiredCount || 0} unit(s) exceeding 80% threshold.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {urgentBins.slice(0, 4).map((b) => (
                    <span
                      key={b.id}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                    >
                      {b.bin_name.split('-')[0].trim()} ({b.fill_percentage}%)
                    </span>
                  ))}
                  {urgentBins.length > 4 && (
                    <span className="text-[11px] text-slate-500 px-1 py-0.5">
                      +{urgentBins.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/route-optimization')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              Optimize Pickup Route
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Analytics Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Dustbins"
            value={analytics?.totalBins || 0}
            subtitle="Campus IoT sensor network"
            icon={Trash2}
          />
          <StatCard
            title="Average Capacity"
            value={`${analytics?.averageFill || 0}%`}
            subtitle="Aggregate fill across fleet"
            icon={Percent}
            color={
              (analytics?.averageFill || 0) >= 80
                ? 'rose'
                : (analytics?.averageFill || 0) >= 50
                ? 'amber'
                : 'emerald'
            }
          />
          <StatCard
            title="Total Waste Stored"
            value={`${totalVolumeLiters}L`}
            subtitle="Calculated from 120L capacity/bin"
            icon={HardDrive}
            color="default"
          />
          <StatCard
            title="Collection Dispatch"
            value={analytics?.totalNeedingCollection || 0}
            subtitle={`${analytics?.overflowRiskCount || 0} overflow · ${analytics?.collectionRequiredCount || 0} required`}
            icon={AlertTriangle}
            color={(analytics?.totalNeedingCollection || 0) > 0 ? 'orange' : 'emerald'}
            alertBadge={analytics?.totalNeedingCollection ? 'Active' : undefined}
          />
        </div>

        {/* Visual Inspection Spotlight Section */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-300" />
                Live Sensor Node Inspection
              </h3>
              <p className="text-xs text-slate-400">
                Cross-section hardware chamber view and camera zone telemetry
              </p>
            </div>

            {/* Quick bin selector dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Inspect Node:</span>
              <select
                value={selectedPreviewBin?.id || ''}
                onChange={(e) => {
                  const b = bins.find((item) => item.id === e.target.value);
                  if (b) setSelectedPreviewBin(b);
                }}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
              >
                {bins.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bin_name} ({b.fill_percentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedPreviewBin && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {/* Visual Smart Bin Chamber Graphic */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-slate-400 font-mono mb-2">
                  CHAMBER COMPACTOR STATUS
                </span>
                <SmartBinVisual fillPercentage={selectedPreviewBin.fill_percentage} size="lg" />
                <div className="mt-3 flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>Fill: <strong className="text-white">{selectedPreviewBin.fill_percentage}%</strong></span>
                  <span>·</span>
                  <span>Volume: <strong className="text-white">{Math.round((selectedPreviewBin.fill_percentage / 100) * 120)}L</strong></span>
                </div>
              </div>

              {/* Architectural CAD Zone Camera View */}
              <div className="md:col-span-2 p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-white">{selectedPreviewBin.bin_name}</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      Location: {selectedPreviewBin.location}
                    </span>
                  </div>
                  <CampusZoneVisual location={selectedPreviewBin.location} fillPercentage={selectedPreviewBin.fill_percentage} height={120} />
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                    <span>Coordinates: ({selectedPreviewBin.coord_x}, {selectedPreviewBin.coord_y})</span>
                    <span>·</span>
                    <span>Status: <strong className="text-slate-200">{selectedPreviewBin.status}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/route-optimization')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      Route Map
                    </button>
                    <button
                      onClick={() => navigate('/bins')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      Fleet Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts & AI Operational Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fill Distribution Chart */}
          <div className="lg:col-span-2 rounded-xl bg-slate-900 border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-white">Fill Level Distribution</h3>
                <p className="text-xs text-slate-400">Current sensor readings categorized by threshold</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                10 nodes
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 15 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-400 uppercase">Normal</span>
                <span className="font-semibold text-emerald-400 font-mono text-sm tabular-nums">
                  {analytics?.normalCount || 0}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-400 uppercase">Filling</span>
                <span className="font-semibold text-yellow-400 font-mono text-sm tabular-nums">
                  {analytics?.fillingCount || 0}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-400 uppercase">Required</span>
                <span className="font-semibold text-amber-400 font-mono text-sm tabular-nums">
                  {analytics?.collectionRequiredCount || 0}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-400 uppercase">Overflow</span>
                <span className="font-semibold text-rose-400 font-mono text-sm tabular-nums">
                  {analytics?.overflowRiskCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Quick AI & Operations Summary */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-slate-300" />
                <h4 className="font-semibold text-sm text-white">Operations Brief</h4>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <p>
                  {analytics?.overflowRiskCount
                    ? `${analytics.overflowRiskCount} critical bin(s) at 100% capacity require immediate dispatch.`
                    : analytics?.collectionRequiredCount
                    ? `${analytics.collectionRequiredCount} dustbin(s) need pickup. Nearest-neighbor route is ready.`
                    : 'All campus dustbins are below the 80% threshold. Normal patrol schedule in effect.'}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => navigate('/ai-assistant')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  View Gemini AI Report
                </button>
                <button
                  onClick={() => navigate('/bins')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  Fleet Management ({bins.length})
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono">
              <span>Threshold: 80%</span>
              <span>10 Nodes</span>
            </div>
          </div>
        </div>

        {/* Recent Collection Activity Logs */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Recent Collection Logs (PostgreSQL collection_logs)
              </h3>
              <p className="text-xs text-slate-400">Servicing records and previous fill levels</p>
            </div>
            <button
              onClick={() => navigate('/bins')}
              className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              All Bins <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No collection logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2 px-3">Dustbin</th>
                    <th className="py-2 px-3">Location</th>
                    <th className="py-2 px-3">Previous Fill</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {recentLogs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">{log.bin_name}</td>
                      <td className="py-2.5 px-3 text-slate-300">{log.location}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-amber-400">
                        {log.previous_fill_level}%
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5" /> 0% Reset
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(log.collected_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {new Date(log.collected_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
