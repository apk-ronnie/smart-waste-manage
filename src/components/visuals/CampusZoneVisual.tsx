import React from 'react';
import { getStatusConfig } from '../../utils/theme.ts';

interface CampusZoneVisualProps {
  location: string;
  fillPercentage: number;
  className?: string;
  height?: number;
}

export const CampusZoneVisual: React.FC<CampusZoneVisualProps> = ({
  location,
  fillPercentage,
  className = '',
  height = 100,
}) => {
  const config = getStatusConfig(fillPercentage);

  // Determine architectural iconography based on location keywords
  const loc = location.toLowerCase();

  const isCanteen = loc.includes('canteen') || loc.includes('dining');
  const isLibrary = loc.includes('library');
  const isEng = loc.includes('engineering') || loc.includes('hardware') || loc.includes('robotics');
  const isScience = loc.includes('science') || loc.includes('chem');
  const isSports = loc.includes('sports') || loc.includes('gym');
  const isHostel = loc.includes('hostel') || loc.includes('dorm');
  const isAdmin = loc.includes('admin') || loc.includes('president');
  const isTech = loc.includes('tech') || loc.includes('innovation');
  const isHealth = loc.includes('health') || loc.includes('clinic');

  return (
    <div className={`relative w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-800 ${className}`} style={{ height }}>
      {/* Subtle CAD / blueprint grid backdrop */}
      <svg className="w-full h-full select-none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 300 100">
        <defs>
          <pattern id="zoneGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect width="300" height="100" fill="#090d16" />
        <rect width="300" height="100" fill="url(#zoneGrid)" opacity="0.6" />

        {/* Isometric ground footprint */}
        <polygon points="30,85 150,95 270,80 150,65" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />

        {/* Location Building Architecture Rendering */}
        {isLibrary && (
          <g transform="translate(60, 20)">
            {/* Library Classical Columns & Pediment */}
            <rect x="30" y="30" width="80" height="40" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <polygon points="25,30 70,12 115,30" fill="#334155" stroke="#475569" strokeWidth="1" />
            <line x1="42" y1="30" x2="42" y2="70" stroke="#475569" strokeWidth="2" />
            <line x1="56" y1="30" x2="56" y2="70" stroke="#475569" strokeWidth="2" />
            <line x1="84" y1="30" x2="84" y2="70" stroke="#475569" strokeWidth="2" />
            <line x1="98" y1="30" x2="98" y2="70" stroke="#475569" strokeWidth="2" />
            <rect x="63" y="45" width="14" height="25" fill="#090d16" />
          </g>
        )}

        {isCanteen && (
          <g transform="translate(65, 22)">
            {/* Dining Pavilion with canopy */}
            <rect x="25" y="32" width="90" height="38" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <path d="M 20 32 Q 70 20 120 32" fill="#334155" stroke="#475569" strokeWidth="1.2" />
            {/* Windows */}
            <rect x="32" y="38" width="18" height="16" fill="#090d16" stroke="#334155" />
            <rect x="58" y="38" width="18" height="16" fill="#090d16" stroke="#334155" />
            <rect x="84" y="38" width="18" height="16" fill="#090d16" stroke="#334155" />
            {/* Outdoor tables */}
            <circle cx="135" cy="65" r="7" fill="#1e293b" stroke="#334155" />
            <circle cx="150" cy="72" r="5" fill="#1e293b" stroke="#334155" />
          </g>
        )}

        {isEng && (
          <g transform="translate(60, 18)">
            {/* Tech & Hardware Lab Block */}
            <rect x="25" y="24" width="95" height="48" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect x="35" y="14" width="40" height="10" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            {/* HVAC & solar vents on roof */}
            <rect x="85" y="16" width="15" height="8" fill="#334155" />
            <line x1="40" y1="32" x2="110" y2="32" stroke="#475569" strokeDasharray="3 3" />
            <line x1="40" y1="46" x2="110" y2="46" stroke="#475569" strokeDasharray="3 3" />
          </g>
        )}

        {isScience && (
          <g transform="translate(65, 20)">
            {/* Science Complex Glass Atrium */}
            <polygon points="30,70 50,25 90,25 110,70" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <line x1="70" y1="25" x2="70" y2="70" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
            <line x1="45" y1="45" x2="95" y2="45" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
          </g>
        )}

        {isSports && (
          <g transform="translate(60, 22)">
            {/* Arena Curved Dome */}
            <path d="M 25 70 A 50 45 0 0 1 115 70 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <line x1="25" y1="70" x2="115" y2="70" stroke="#475569" strokeWidth="1.5" />
            {/* Track curve */}
            <path d="M 125 50 Q 155 75 140 85" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          </g>
        )}

        {isHostel && (
          <g transform="translate(60, 20)">
            {/* Dormitory Block */}
            <rect x="25" y="22" width="40" height="50" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect x="70" y="28" width="45" height="44" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            {/* Window rows */}
            <rect x="30" y="28" width="6" height="8" fill="#090d16" />
            <rect x="42" y="28" width="6" height="8" fill="#090d16" />
            <rect x="30" y="42" width="6" height="8" fill="#090d16" />
            <rect x="42" y="42" width="6" height="8" fill="#090d16" />
            <rect x="76" y="34" width="6" height="8" fill="#090d16" />
            <rect x="88" y="34" width="6" height="8" fill="#090d16" />
          </g>
        )}

        {isAdmin && (
          <g transform="translate(60, 20)">
            {/* Admin Rotunda */}
            <rect x="35" y="30" width="70" height="42" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <circle cx="70" cy="22" r="14" fill="#334155" stroke="#475569" />
            <line x1="70" y1="8" x2="70" y2="2" stroke="#94a3b8" strokeWidth="1" />
          </g>
        )}

        {isTech && (
          <g transform="translate(60, 20)">
            {/* Tech Hub Tower & Glass Facade */}
            <rect x="30" y="16" width="35" height="56" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect x="70" y="30" width="45" height="42" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <line x1="38" y1="20" x2="38" y2="65" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
            <line x1="50" y1="20" x2="50" y2="65" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
          </g>
        )}

        {isHealth && (
          <g transform="translate(60, 20)">
            {/* Health Center with Red Cross emblem outline */}
            <rect x="30" y="28" width="80" height="44" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect x="66" y="36" width="8" height="20" fill="#334155" />
            <rect x="60" y="42" width="20" height="8" fill="#334155" />
          </g>
        )}

        {/* Foreground Smart Dustbin Unit Icon */}
        <g transform="translate(210, 48)">
          <rect x="0" y="0" width="16" height="28" rx="2" fill="#0f172a" stroke={config.dotColor} strokeWidth="1" />
          <rect x="3" y="12" width="10" height="12" rx="1" fill={config.dotColor} fillOpacity="0.4" />
          <circle cx="8" cy="4" r="1.5" fill={config.dotColor} />
          {/* Signal wave */}
          <path d="M 4 -3 A 6 6 0 0 1 12 -3" fill="none" stroke="#64748b" strokeWidth="0.8" />
        </g>

        {/* Camera Sensor Watermark / Crosshair */}
        <line x1="12" y1="12" x2="22" y2="12" stroke="#475569" strokeWidth="1" />
        <line x1="12" y1="12" x2="12" y2="22" stroke="#475569" strokeWidth="1" />
        <line x1="288" y1="12" x2="278" y2="12" stroke="#475569" strokeWidth="1" />
        <line x1="288" y1="12" x2="288" y2="22" stroke="#475569" strokeWidth="1" />
      </svg>

      {/* Camera Telemetry Overlay */}
      <div className="absolute top-2 left-2.5 flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dotColor }} />
        <span className="uppercase text-[9px] text-slate-300">CAM OPTICAL SENSOR</span>
      </div>

      <div className="absolute bottom-2 right-2.5 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
        CAPACITY: <span className="font-semibold text-white">{fillPercentage}%</span>
      </div>
    </div>
  );
};
