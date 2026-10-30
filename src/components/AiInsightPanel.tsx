import React from 'react';
import { Sparkles, AlertOctagon, AlertTriangle, Info, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AiInsightsResponse, AiPriorityItem } from '../../server/geminiService.ts';

interface AiInsightPanelProps {
  insights: AiInsightsResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  error?: string | null;
}

export const AiInsightPanel: React.FC<AiInsightPanelProps> = ({
  insights,
  isLoading,
  onRefresh,
  error,
}) => {
  const navigate = useNavigate();

  const getUrgencyBadge = (urgency: AiPriorityItem['urgency']) => {
    switch (urgency) {
      case 'Immediate':
        return {
          icon: AlertOctagon,
          bg: 'bg-rose-950/40',
          border: 'border-rose-800/60',
          text: 'text-rose-400',
        };
      case 'High':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-950/40',
          border: 'border-amber-800/60',
          text: 'text-amber-400',
        };
      case 'Normal':
        return {
          icon: Info,
          bg: 'bg-yellow-950/30',
          border: 'border-yellow-800/50',
          text: 'text-yellow-400',
        };
      default:
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-950/30',
          border: 'border-emerald-800/50',
          text: 'text-emerald-400',
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Panel */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">
                Gemini Operations Assistant
              </h3>
              {insights && (
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {insights.source}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Evaluates live IoT telemetry, identifies overflowing dustbins, and generates collection priorities.
            </p>
          </div>

          <div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Analyzing...' : 'Generate AI Insights'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Insights Content */}
      {insights ? (
        <div className="space-y-5">
          {/* Operational Summary */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Operational Summary
            </h4>
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
              {insights.summary}
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500">
              <span>Analysis time: {new Date(insights.generatedAt).toLocaleTimeString()}</span>
              <button
                onClick={() => navigate('/route-optimization')}
                className="flex items-center gap-1 text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
              >
                Go to Route Planner <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Prioritized Action Items */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Priority Dustbins &amp; Analysis</span>
              <span className="font-mono text-slate-500 text-[11px]">
                {insights.priorities.length} items
              </span>
            </h4>

            <div className="space-y-2.5">
              {insights.priorities.map((item, idx) => {
                const badge = getUrgencyBadge(item.urgency);
                const Icon = badge.icon;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{item.bin_name}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <Icon className="w-2.5 h-2.5" />
                          {item.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.reasoning}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 mb-3">
            No active operational summary. Click &ldquo;Generate AI Insights&rdquo; to analyze current bin fill levels.
          </p>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            Start Analysis
          </button>
        </div>
      )}
    </div>
  );
};
