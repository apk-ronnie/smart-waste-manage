import React, { useEffect, useState } from 'react';
import { Navigation, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout.tsx';
import { RouteVisualizer } from '../components/RouteVisualizer.tsx';
import { RouteOptimizationResult } from '../../server/routeOptimizer.ts';
import { BinData } from '../components/BinCard.tsx';
import api from '../services/api.ts';

export const RouteOptimizationPage: React.FC = () => {
  const [routeData, setRouteData] = useState<RouteOptimizationResult | null>(null);
  const [allBins, setAllBins] = useState<BinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollecting, setIsCollecting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRouteAndBins = async () => {
    try {
      const [routeRes, binsRes] = await Promise.all([
        api.get('/route'),
        api.get('/bins'),
      ]);
      setRouteData(routeRes.data);
      setAllBins(binsRes.data.bins);
    } catch (err) {
      console.error('Failed to load route optimization data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouteAndBins();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkRouteCollected = async () => {
    if (!routeData || routeData.steps.length === 0) return;
    setIsCollecting(true);
    const binIds = routeData.steps.map((s) => s.bin.id);

    try {
      const res = await api.post('/bins/collect', { binIds });
      showToast(`Success: ${res.data.collectedCount} dustbin(s) collected and reset to 0%.`);
      await fetchRouteAndBins();
    } catch (err) {
      console.error('Route collection error:', err);
    } finally {
      setIsCollecting(false);
    }
  };

  const handleSimulate = async () => {
    try {
      await api.post('/bins/simulate');
      await fetchRouteAndBins();
      showToast('Sensors simulated. Route updated.');
    } catch (e) {
      console.error('Simulation error:', e);
    }
  };

  return (
    <DashboardLayout onSimulate={handleSimulate}>
      <div className="p-6 md:p-8 space-y-5 max-w-7xl mx-auto w-full">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 p-3.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Route Planner
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic nearest-neighbor collection route for dustbins requiring pickup (&ge; 80% capacity).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              Simulate Telemetry
            </button>
            <button
              onClick={fetchRouteAndBins}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Route"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Route Visualizer Container */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Calculating optimal sequence...</p>
          </div>
        ) : routeData ? (
          <RouteVisualizer
            routeData={routeData}
            allBins={allBins}
            onMarkAllCollected={handleMarkRouteCollected}
            isCollecting={isCollecting}
          />
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">Unable to calculate route.</div>
        )}
      </div>
    </DashboardLayout>
  );
};
