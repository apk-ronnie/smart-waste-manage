import React from 'react';
import { getStatusConfig } from '../../utils/theme.ts';

interface SmartBinVisualProps {
  fillPercentage: number;
  binName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDetails?: boolean;
}

export const SmartBinVisual: React.FC<SmartBinVisualProps> = ({
  fillPercentage,
  binName,
  size = 'md',
  className = '',
  showDetails = false,
}) => {
  const config = getStatusConfig(fillPercentage);
  const fillClamped = Math.min(100, Math.max(0, fillPercentage));

  // Dimensions based on size
  const height = size === 'sm' ? 80 : size === 'lg' ? 180 : 120;
  const width = Math.round(height * 0.65);

  // Waste fill height inside the inner chamber (from bottom of chamber at y=85 to top at y=25, height 60)
  const chamberTop = 26;
  const chamberHeight = 60;
  const fillH = (fillClamped / 100) * chamberHeight;
  const fillY = chamberTop + chamberHeight - fillH;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 135"
        width={width}
        height={height}
        className="select-none"
      >
        <defs>
          {/* Subtle metallic linear gradient */}
          <linearGradient id="binBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="25%" stopColor="#334155" />
            <stop offset="70%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Chamber glass overlay */}
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </linearGradient>

          {/* Waste pattern gradient */}
          <linearGradient id="wasteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.dotColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor={config.dotColor} stopOpacity="0.45" />
          </linearGradient>

          {/* Subtle waste texture pattern */}
          <pattern id="wastePattern" width="10" height="8" patternUnits="userSpaceOnUse">
            <path d="M 0 4 Q 5 0, 10 4 Q 5 8, 0 4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* Solar cap on top */}
        <polygon points="26,10 74,10 78,16 22,16" fill="#090d16" stroke="#475569" strokeWidth="1" />
        <line x1="30" y1="13" x2="70" y2="13" stroke="#38bdf8" strokeWidth="1" opacity="0.6" strokeDasharray="3 2" />

        {/* Sensor Pod & LED Indicator */}
        <rect x="42" y="16" width="16" height="5" rx="1.5" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
        {/* Status LED */}
        <circle cx="50" cy="18.5" r="1.8" fill={config.dotColor} />

        {/* Main Bin Housing Body */}
        <rect x="22" y="21" width="56" height="98" rx="4" fill="url(#binBodyGrad)" stroke="#334155" strokeWidth="1.2" />

        {/* Top Drop Door / Flap */}
        <rect x="28" y="24" width="44" height="14" rx="2" fill="#0b1120" stroke="#334155" strokeWidth="0.8" />
        <line x1="34" y1="31" x2="66" y2="31" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

        {/* Transparent Optical Inspection Window / Fill Level Display */}
        <rect x="28" y="42" width="44" height="66" rx="2" fill="url(#glassGrad)" stroke="#334155" strokeWidth="1" />

        {/* Internal Fill Level (Waste) */}
        {fillClamped > 0 && (
          <g>
            <rect
              x="29"
              y={42 + (66 - (fillClamped / 100) * 64)}
              width="42"
              height={(fillClamped / 100) * 64}
              rx="1.5"
              fill="url(#wasteGrad)"
            />
            <rect
              x="29"
              y={42 + (66 - (fillClamped / 100) * 64)}
              width="42"
              height={(fillClamped / 100) * 64}
              fill="url(#wastePattern)"
              opacity="0.7"
            />
            {/* Top surface line of waste */}
            <line
              x1="30"
              y1={42 + (66 - (fillClamped / 100) * 64)}
              x2="70"
              y2={42 + (66 - (fillClamped / 100) * 64)}
              stroke="#ffffff"
              strokeWidth="1"
              opacity="0.6"
            />
          </g>
        )}

        {/* Measurement ticks on the side of window */}
        <line x1="30" y1="46" x2="33" y2="46" stroke="#64748b" strokeWidth="0.8" opacity="0.7" />
        <line x1="30" y1="62" x2="34" y2="62" stroke="#64748b" strokeWidth="0.8" opacity="0.7" />
        <line x1="30" y1="78" x2="34" y2="78" stroke="#64748b" strokeWidth="0.8" opacity="0.7" />
        <line x1="30" y1="94" x2="33" y2="94" stroke="#64748b" strokeWidth="0.8" opacity="0.7" />

        {/* 80% threshold line indicator */}
        <line
          x1="28"
          y1={42 + 66 * 0.2}
          x2="72"
          y2={42 + 66 * 0.2}
          stroke="#f59e0b"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          opacity="0.8"
        />

        {/* Bin base plinth / anchor */}
        <rect x="20" y="119" width="60" height="7" rx="1.5" fill="#090d16" stroke="#334155" strokeWidth="1" />

        {/* Clean Numerical Percentage Display overlay */}
        <rect x="34" y="86" width="32" height="15" rx="2" fill="#020617" fillOpacity="0.8" stroke="#334155" strokeWidth="0.5" />
        <text
          x="50"
          y="97"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="9"
          fontWeight="700"
          fontFamily="monospace"
        >
          {fillPercentage}%
        </text>
      </svg>

      {showDetails && (
        <div className="mt-1 text-center">
          <span className="text-[10px] font-mono font-medium text-slate-400">
            {fillPercentage}% Full
          </span>
        </div>
      )}
    </div>
  );
};
