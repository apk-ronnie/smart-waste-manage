import React, { useState } from 'react';
import { Trash2, MapPin, CheckCircle2, AlertTriangle, AlertOctagon, Camera, Eye } from 'lucide-react';
import { getStatusConfig, formatTimeAgo } from '../utils/theme.ts';
import { SmartBinVisual } from './visuals/SmartBinVisual.tsx';
import { CampusZoneVisual } from './visuals/CampusZoneVisual.tsx';

export interface BinData {
  id: string;
  bin_name: string;
  location: string;
  coord_x: number;
  coord_y: number;
  fill_percentage: number;
  status: string;
  last_updated: string;
}

interface BinCardProps {
  bin: BinData;
  onCollect: (binId: string) => Promise<void>;
}

export const BinCard: React.FC<BinCardProps> = ({ bin, onCollect }) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [viewMode, setViewMode] = useState<'gauge' | 'camera'>('gauge');
  const config = getStatusConfig(bin.fill_percentage);

  const handleCollect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollecting(true);
    try {
      await onCollect(bin.id);
    } finally {
      setIsCollecting(false);
    }
  };

  const isOverflow = bin.fill_percentage >= 100;
  const isRequired = bin.fill_percentage >= 80 && !isOverflow;

  return (
    <div
      className={`rounded-xl bg-slate-900 p-4 transition-colors border flex flex-col justify-between ${
        isOverflow
          ? 'border-rose-800/80 bg-rose-950/10'
          : isRequired
          ? 'border-amber-800/70 bg-amber-950/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div>
        {/* Top Header: Title & Status */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-white truncate">
              {bin.bin_name}
            </h4>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{bin.location}</span>
            </p>
          </div>

          <span
            className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
          >
            {isOverflow ? (
              <AlertOctagon className="w-3 h-3 text-rose-400" />
            ) : isRequired ? (
              <AlertTriangle className="w-3 h-3 text-amber-400" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
            {config.label}
          </span>
        </div>

        {/* View Switcher: Gauge vs Camera Snapshot */}
        <div className="flex items-center justify-between mb-2 text-[11px] text-slate-400">
          <span className="font-mono text-slate-500">Node #{bin.id.slice(0, 4)}</span>
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setViewMode('gauge')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                viewMode === 'gauge' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chamber
            </button>
            <button
              onClick={() => setViewMode('camera')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'camera' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-2.5 h-2.5" />
              Cam
            </button>
          </div>
        </div>

        {/* Visual Display Center */}
        {viewMode === 'gauge' ? (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-4">
            {/* Visual Smart Bin Cross-Section */}
            <div className="shrink-0">
              <SmartBinVisual fillPercentage={bin.fill_percentage} size="md" />
            </div>

            {/* Metrics & Chamber status */}
            <div className="flex-1 space-y-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                  Capacity Level
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono tabular-nums text-white">
                    {bin.fill_percentage}%
                  </span>
                  <span className="text-[11px] text-slate-400">/ 120L</span>
                </div>
              </div>

              {/* Clean Flat Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${config.barColor}`}
                  style={{ width: `${Math.min(100, Math.max(1, bin.fill_percentage))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Solar: Active</span>
                <span>Press: 1.2 bar</span>
              </div>
            </div>
          </div>
        ) : (
          /* Visual Camera Inspection Snapshot */
          <div className="space-y-1.5">
            <CampusZoneVisual location={bin.location} fillPercentage={bin.fill_percentage} height={120} />
          </div>
        )}
      </div>

      {/* Footer: Position, Timestamp, and Collect Action */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs">
        <div className="text-[11px] text-slate-400 font-mono">
          <span>Coord: ({bin.coord_x}, {bin.coord_y})</span>
          <span className="text-slate-600 mx-1.5">·</span>
          <span>{formatTimeAgo(bin.last_updated)}</span>
        </div>

        <button
          onClick={handleCollect}
          disabled={isCollecting || bin.fill_percentage === 0}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            bin.fill_percentage === 0
              ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95'
          }`}
          title={bin.fill_percentage === 0 ? 'Bin is already empty' : 'Empty Dustbin'}
        >
          {isCollecting ? (
            <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : bin.fill_percentage === 0 ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-slate-500" />
              Empty
            </>
          ) : (
            <>
              <Trash2 className="w-3 h-3 text-slate-300" />
              Collect
            </>
          )}
        </button>
      </div>
    </div>
  );
};
