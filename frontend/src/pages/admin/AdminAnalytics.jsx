import { BarChart3, TrendingUp, Shield, Users, Activity, CheckCircle2 } from 'lucide-react';

export default function AdminAnalytics() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Macro Trust Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Platform Trust Analytics</h1>
        <p className="text-sm text-surface-500 mt-1">Aggregate counterparty reliability and dispute resolution throughput.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <span className="text-xs text-surface-500 font-semibold uppercase tracking-wider">Average Trust Score</span>
          <p className="text-2xl font-bold text-surface-900 mt-1 font-mono">88.4 / 100</p>
          <span className="text-xs text-accent-600 mt-0.5 block">+3.2% this quarter</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <span className="text-xs text-surface-500 font-semibold uppercase tracking-wider">On-Time Delivery Rate</span>
          <p className="text-2xl font-bold text-surface-900 mt-1 font-mono">94.1%</p>
          <span className="text-xs text-brand-600 mt-0.5 block">Across all categories</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <span className="text-xs text-surface-500 font-semibold uppercase tracking-wider">Dispute Frequency</span>
          <p className="text-2xl font-bold text-surface-900 mt-1 font-mono">1.8%</p>
          <span className="text-xs text-accent-600 mt-0.5 block">Industry low</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <span className="text-xs text-surface-500 font-semibold uppercase tracking-wider">AI Accuracy Rate</span>
          <p className="text-2xl font-bold text-surface-900 mt-1 font-mono">97.6%</p>
          <span className="text-xs text-indigo-600 mt-0.5 block">Document extraction</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-surface-900">Industry Performance Index</h3>
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-surface-700 mb-1">
              <span>Furniture & Wood Craft</span>
              <span className="font-mono font-bold">92% Trust Adherence</span>
            </div>
            <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
              <div className="h-full bg-accent-500" style={{ width: '92%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between font-semibold text-surface-700 mb-1">
              <span>Industrial Metal & Fabrications</span>
              <span className="font-mono font-bold">96% Trust Adherence</span>
            </div>
            <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
              <div className="h-full bg-accent-500" style={{ width: '96%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between font-semibold text-surface-700 mb-1">
              <span>Textiles & Packaging</span>
              <span className="font-mono font-bold">88% Trust Adherence</span>
            </div>
            <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
              <div className="h-full bg-brand-500" style={{ width: '88%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
