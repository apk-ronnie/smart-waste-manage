export type BinStatus = 'Normal' | 'Filling' | 'Collection Required' | 'Overflow Risk';

export interface StatusConfig {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  barColor: string;
  dotColor: string;
}

export function getStatusConfig(fill: number): StatusConfig {
  if (fill >= 100) {
    return {
      label: 'Overflow Risk',
      badgeBg: 'bg-rose-950/40',
      badgeText: 'text-rose-400',
      badgeBorder: 'border-rose-800/60',
      barColor: 'bg-rose-500',
      dotColor: '#f43f5e',
    };
  }
  if (fill >= 80) {
    return {
      label: 'Collection Required',
      badgeBg: 'bg-amber-950/40',
      badgeText: 'text-amber-400',
      badgeBorder: 'border-amber-800/60',
      barColor: 'bg-amber-500',
      dotColor: '#f59e0b',
    };
  }
  if (fill >= 50) {
    return {
      label: 'Filling',
      badgeBg: 'bg-yellow-950/30',
      badgeText: 'text-yellow-400',
      badgeBorder: 'border-yellow-800/50',
      barColor: 'bg-yellow-500',
      dotColor: '#eab308',
    };
  }
  return {
    label: 'Normal',
    badgeBg: 'bg-emerald-950/30',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-800/50',
    barColor: 'bg-emerald-500',
    dotColor: '#10b981',
  };
}

export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recent';
  }
}
