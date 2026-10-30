import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout.tsx';
import { AiInsightPanel } from '../components/AiInsightPanel.tsx';
import { AiInsightsResponse } from '../../server/geminiService.ts';
import api from '../services/api.ts';

export const AiAssistantPage: React.FC = () => {
  const [insights, setInsights] = useState<AiInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchAiInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/insights');
      setInsights(res.data);
      setToastMessage('AI Operational Insights updated.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to fetch AI insights.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAiInsights();
  }, []);

  const handleSimulate = async () => {
    try {
      await api.post('/bins/simulate');
      await fetchAiInsights();
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

        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              AI Operations Assistant
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Google Gemini intelligence analyzing campus IoT telemetry and servicing priorities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              Simulate &amp; Re-Analyze
            </button>
          </div>
        </div>

        {/* AI Insight Panel */}
        <AiInsightPanel
          insights={insights}
          isLoading={isLoading}
          onRefresh={fetchAiInsights}
          error={error}
        />
      </div>
    </DashboardLayout>
  );
};
