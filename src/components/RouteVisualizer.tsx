import React, { useState } from 'react';
import { RouteOptimizationResult, RouteStep } from '../../server/routeOptimizer.ts';
import { BinData } from './BinCard.tsx';
import { getStatusConfig } from '../utils/theme.ts';
import { Navigation, MapPin, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface RouteVisualizerProps {
  routeData: RouteOptimizationResult;
  allBins?: BinData[];
  onMarkAllCollected: () => Promise<void>;
  isCollecting?: boolean;
}

export const RouteVisualizer: React.FC<RouteVisualizerProps> = ({
  routeData,
  allBins = [],
  onMarkAllCollected,
  isCollecting = false,
}) => {
  const [selectedStep, setSelectedStep] = useState<RouteStep | null>(null);

  // SVG dimensions for map
  const width = 800;
  const height = 480;
  const padding = 45;

  const scaleX = (x: number) => padding + (x / 100) * (width - 2 * padding);
  const scaleY = (y: number) => height - (padding + (y / 100) * (height - 2 * padding));

  const depotPos = {
    x: scaleX(routeData.depot.coord_x),
    y: scaleY(routeData.depot.coord_y),
  };

  let pathD = `M ${depotPos.x} ${depotPos.y}`;
  const points: { x: number; y: number; step: RouteStep }[] = [];

  routeData.steps.forEach((step) => {
    const px = scaleX(step.bin.coord_x);
    const py = scaleY(step.bin.coord_y);
    points.push({ x: px, y: py, step });
    pathD += ` L ${px} ${py}`;
  });

  return (
    <div className="space-y-6">
      {/* Route Analytics Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Pickup Sequence</p>
          <p className="text-2xl font-bold text-white tabular-nums mt-1">
            {routeData.binsToCollectCount} <span className="text-sm font-normal text-slate-400">stops</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Bins &ge; 80% fill capacity</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Total Route Distance</p>
          <p className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
            {routeData.totalDistance} <span className="text-sm font-normal text-slate-400">units</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Nearest-Neighbor shortest path</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Estimated Duration</p>
          <p className="text-2xl font-bold text-white tabular-nums mt-1">
            ~{routeData.estimatedTimeMinutes} <span className="text-sm font-normal text-slate-400">min</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Transit + 3m service per bin</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Action</p>
            <p className="text-xs text-slate-300 mt-0.5">Reset {routeData.binsToCollectCount} bins to 0%</p>
          </div>
          <button
            onClick={onMarkAllCollected}
            disabled={isCollecting || routeData.binsToCollectCount === 0}
            className={`mt-2 w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              routeData.binsToCollectCount === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50 active:scale-95'
            }`}
          >
            {isCollecting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Route Collected
              </>
            )}
          </button>
        </div>
      </div>

      {/* Campus Map: Clean Architectural GIS Layout */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-sm text-white">Campus Coordinate Map (2D Grid)</h3>
            <p className="text-xs text-slate-400">
              Deterministic sequence calculated from Operations Hub (0,0)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              Depot (0,0)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              &ge; 80% Required
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              100% Overflow
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              &lt; 80% Normal
            </span>
          </div>
        </div>

        {/* Clean SVG Canvas */}
        <div className="relative w-full aspect-[16/10] max-h-[460px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Subtle technical grid */}
            <defs>
              <pattern id="minimal-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>

            <rect width={width} height={height} fill="url(#minimal-grid)" />

            {/* Campus Boundary Outline */}
            <rect
              x={padding}
              y={padding}
              width={width - 2 * padding}
              height={height - 2 * padding}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Coordinate labels */}
            <text x={padding + 8} y={height - padding - 8} fill="#64748b" fontSize="10" fontFamily="monospace">
              (0, 0)
            </text>
            <text x={width - padding - 40} y={padding + 16} fill="#64748b" fontSize="10" fontFamily="monospace">
              (100, 100)
            </text>

            {/* Inactive bins (< 80%) rendered as subtle small dots */}
            {allBins
              .filter((b) => b.fill_percentage < 80)
              .map((bin) => {
                const bx = scaleX(bin.coord_x);
                const by = scaleY(bin.coord_y);
                return (
                  <g key={bin.id} className="opacity-50 hover:opacity-100 transition-opacity">
                    <circle cx={bx} cy={by} r="4" fill="#334155" stroke="#475569" strokeWidth="1" />
                    <text x={bx + 6} y={by + 3} fill="#64748b" fontSize="9" fontFamily="sans-serif">
                      {bin.bin_name.split('-')[0].trim()} ({bin.fill_percentage}%)
                    </text>
                  </g>
                );
              })}

            {/* Route Technical Line - Crisp, No Neon Glow */}
            {routeData.steps.length > 0 && (
              <path
                d={pathD}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 3"
              />
            )}

            {/* Depot Node */}
            <g transform={`translate(${depotPos.x}, ${depotPos.y})`}>
              <circle r="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="10" y="3.5" fill="#38bdf8" fontSize="11" fontWeight="600" fontFamily="sans-serif">
                Depot (0,0)
              </text>
            </g>

            {/* Ordered Route Stops */}
            {points.map(({ x, y, step }) => {
              const config = getStatusConfig(step.bin.fill_percentage);
              const isSelected = selectedStep?.bin.id === step.bin.id;

              return (
                <g
                  key={step.bin.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => setSelectedStep(step)}
                  className="cursor-pointer"
                >
                  <circle
                    r={isSelected ? '10' : '8'}
                    fill={config.dotColor}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? '2' : '1.5'}
                  />

                  {/* Step Number in circle */}
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {step.stepNumber}
                  </text>

                  {/* Label */}
                  <text
                    x="12"
                    y="-3"
                    fill="#e2e8f0"
                    fontSize="10"
                    fontWeight="600"
                  >
                    #{step.stepNumber} {step.bin.bin_name.split('-')[0].trim()}
                  </text>
                  <text
                    x="12"
                    y="9"
                    fill={config.dotColor}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {step.bin.fill_percentage}% · +{step.distanceFromPrevious} dist
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
            Grid Scale 0–100
          </div>
        </div>
      </div>

      {/* Step by Step Breakdown List */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <h4 className="font-semibold text-sm text-white mb-3 flex items-center justify-between">
          <span>Ordered Pickup Schedule</span>
          <span className="text-xs text-slate-400 font-normal">
            {routeData.steps.length} stops
          </span>
        </h4>

        {routeData.steps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No dustbins currently require collection. All levels are below the 80% threshold.
          </div>
        ) : (
          <div className="space-y-2">
            {routeData.steps.map((step) => {
              const config = getStatusConfig(step.bin.fill_percentage);
              const isSelected = selectedStep?.bin.id === step.bin.id;

              return (
                <div
                  key={step.bin.id}
                  onClick={() => setSelectedStep(step)}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800 border-slate-600'
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-semibold text-slate-200 shrink-0">
                      {step.stepNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-white">{step.bin.bin_name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
                        >
                          {step.bin.fill_percentage}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        {step.bin.location} <span className="text-slate-600">·</span> ({step.bin.coord_x}, {step.bin.coord_y})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pl-9 md:pl-0">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Leg</span>
                      <span className="text-slate-300">+{step.distanceFromPrevious} u</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total</span>
                      <span className="text-white font-semibold">{step.cumulativeDistance} u</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
