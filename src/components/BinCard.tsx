import React, { useState } from 'react';
import { Trash2, MapPin, CheckCircle2, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';
import { getStatusConfig, formatTimeAgo } from '../utils/theme.ts';

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
      className={`rounded-xl bg-slate-900 p-5 transition-colors border ${
        isOverflow
          ? 'border-rose-800/80 bg-rose-950/10'
          : isRequired
          ? 'border-amber-800/70 bg-amber-950/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Header: Title & Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
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

      {/* Sensor Fill Level */}
      <div className="my-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-slate-400">Fill Capacity</span>
          <span className="text-lg font-bold font-mono tabular-nums text-white">
            {bin.fill_percentage}%
          </span>
        </div>

        {/* Clean, Flat Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${config.barColor}`}
            style={{ width: `${Math.min(100, Math.max(1, bin.fill_percentage))}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
          <span>0%</span>
          <span>50%</span>
          <span>80% threshold</span>
          <span>100%</span>
        </div>
      </div>

      {/* Footer: Coordinates, Timestamp, and Collect Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <div className="text-[11px] text-slate-400 font-mono">
          <span>Pos: ({bin.coord_x}, {bin.coord_y})</span>
          <span className="text-slate-600 mx-1.5">·</span>
          <span className="text-slate-400">{formatTimeAgo(bin.last_updated)}</span>
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
