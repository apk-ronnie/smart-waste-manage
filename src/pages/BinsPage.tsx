import React, { useEffect, useState } from 'react';
import {
  Trash2,
  RefreshCw,
  Plus,
  Search,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout.tsx';
import { BinCard, BinData } from '../components/BinCard.tsx';
import api from '../services/api.ts';

export const BinsPage: React.FC = () => {
  const [bins, setBins] = useState<BinData[]>([]);
  const [filteredBins, setFilteredBins] = useState<BinData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New bin form state
  const [newBinName, setNewBinName] = useState('');
  const [newBinLocation, setNewBinLocation] = useState('');
  const [newBinX, setNewBinX] = useState<number>(50);
  const [newBinY, setNewBinY] = useState<number>(50);
  const [isSubmittingBin, setIsSubmittingBin] = useState(false);

  const fetchBins = async () => {
    try {
      const res = await api.get('/bins');
      setBins(res.data.bins);
    } catch (e) {
      console.error('Failed to load bins:', e);
    }
  };

  useEffect(() => {
    fetchBins();
  }, []);

  useEffect(() => {
    let timer: any = null;
    if (autoSimulate) {
      timer = setInterval(() => {
        handleSimulate();
      }, 8000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoSimulate]);

  useEffect(() => {
    let list = [...bins];

    if (statusFilter !== 'ALL') {
      list = list.filter((b) => b.status === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) => b.bin_name.toLowerCase().includes(q) || b.location.toLowerCase().includes(q)
      );
    }

    setFilteredBins(list);
  }, [bins, statusFilter, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post('/bins/simulate');
      setBins(res.data.bins);
      showToast('Sensors simulated: fill levels incremented (+5% to +30%).');
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setTimeout(() => setIsSimulating(false), 400);
    }
  };

  const handleCollectSingle = async (binId: string) => {
    try {
      const res = await api.post('/bins/collect', { binIds: [binId] });
      setBins(res.data.bins);
      showToast('Dustbin collected. Fill reset to 0%.');
    } catch (e) {
      console.error('Collection error:', e);
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await api.post('/bins/reset-demo');
      setBins(res.data.bins);
      showToast('Fleet reset to initial benchmark state.');
    } catch (e) {
      console.error('Reset error:', e);
    }
  };

  const handleCreateBin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBin(true);
    try {
      await api.post('/bins', {
        bin_name: newBinName,
        location: newBinLocation,
        coord_x: Number(newBinX),
        coord_y: Number(newBinY),
      });
      setIsAddModalOpen(false);
      setNewBinName('');
      setNewBinLocation('');
      fetchBins();
      showToast('New campus dustbin deployed.');
    } catch (err: any) {
      console.error('Add bin error:', err);
    } finally {
      setIsSubmittingBin(false);
    }
  };

  const counts = {
    all: bins.length,
    normal: bins.filter((b) => b.fill_percentage < 50).length,
    filling: bins.filter((b) => b.fill_percentage >= 50 && b.fill_percentage < 80).length,
    collection: bins.filter((b) => b.fill_percentage >= 80 && b.fill_percentage < 100).length,
    overflow: bins.filter((b) => b.fill_percentage >= 100).length,
  };

  return (
    <DashboardLayout onSimulate={handleSimulate} isSimulating={isSimulating}>
      <div className="p-6 md:p-8 space-y-5 max-w-7xl mx-auto w-full">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 p-3.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Dustbin Fleet
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live fill levels, status filtering, and IoT sensor simulation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAutoSimulate(!autoSimulate)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                autoSimulate
                  ? 'bg-slate-800 text-emerald-400 border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {autoSimulate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {autoSimulate ? 'Auto-Simulate (8s)' : 'Auto-Simulate'}
            </button>

            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              Simulate (+5%–30%)
            </button>

            <button
              onClick={handleResetDemo}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Reset dustbins to benchmark demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold border border-emerald-500/50 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Dustbin
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
          {/* Segmented Filter */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter('Normal')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'Normal'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Normal &lt;50% ({counts.normal})
            </button>
            <button
              onClick={() => setStatusFilter('Filling')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'Filling'
                  ? 'bg-yellow-950/60 text-yellow-300 border border-yellow-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Filling 50-79% ({counts.filling})
            </button>
            <button
              onClick={() => setStatusFilter('Collection Required')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'Collection Required'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Required 80-99% ({counts.collection})
            </button>
            <button
              onClick={() => setStatusFilter('Overflow Risk')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'Overflow Risk'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overflow 100% ({counts.overflow})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or location..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
            />
          </div>
        </div>

        {/* Dustbin Grid */}
        {filteredBins.length === 0 ? (
          <div className="p-10 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            No dustbins match the current filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBins.map((bin) => (
              <BinCard key={bin.id} bin={bin} onCollect={handleCollectSingle} />
            ))}
          </div>
        )}

        {/* Add Bin Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-white text-sm">
                  Add New Campus Dustbin
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateBin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Dustbin Name / ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newBinName}
                    onChange={(e) => setNewBinName(e.target.value)}
                    placeholder="e.g. Bin #111 - Media Block"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Location Description
                  </label>
                  <input
                    type="text"
                    required
                    value={newBinLocation}
                    onChange={(e) => setNewBinLocation(e.target.value)}
                    placeholder="e.g. North Walkway Gate"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      X Coordinate (0-100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={newBinX}
                      onChange={(e) => setNewBinX(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Y Coordinate (0-100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={newBinY}
                      onChange={(e) => setNewBinY(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBin}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {isSubmittingBin ? 'Saving...' : 'Deploy Dustbin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
