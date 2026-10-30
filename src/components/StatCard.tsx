import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'orange' | 'rose' | 'indigo' | 'default';
  alertBadge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'default',
  alertBadge,
}) => {
  const getBadgeStyle = () => {
    switch (color) {
      case 'rose':
        return 'text-rose-400 bg-rose-950/50 border-rose-800/60';
      case 'orange':
        return 'text-amber-400 bg-amber-950/50 border-amber-800/60';
      case 'amber':
        return 'text-yellow-400 bg-yellow-950/50 border-yellow-800/60';
      case 'emerald':
        return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60';
      default:
        return 'text-slate-400 bg-slate-800/60 border-slate-700/60';
    }
  };

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 transition-colors hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2 pt-0.5">
            <h3 className="text-2xl font-bold text-white tabular-nums">{value}</h3>
            {alertBadge && (
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border ${getBadgeStyle()}`}>
                {alertBadge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-300">
          <Icon className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </div>
  );
};
