import { AlertTriangle, Lock, Clock, MessageSquare, Bot } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

function formatCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function DisputeCard({ dispute, compact = false, onClick, className = '' }) {
  if (compact) {
    return (
      <div
        className={`bg-white rounded-xl border border-surface-200 shadow-sm p-4 card-hover cursor-pointer ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0" />
              <h4 className="font-semibold text-surface-900 text-sm">Dispute #{dispute.id.replace('disp_', '')}</h4>
            </div>
            <p className="text-xs text-surface-500 mt-1 truncate">{dispute.dealTitle}</p>
          </div>
          <StatusBadge status={dispute.status} size="xs" />
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-surface-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            {formatCurrency(dispute.disputedAmount)}
          </span>
          <span>{dispute.lockedStatus}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-100 bg-danger-50/30">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
              <h3 className="text-base font-bold text-surface-900">
                DISPUTE #{dispute.id.replace('disp_', '')}
              </h3>
            </div>
            <p className="text-sm text-surface-600 mt-1">{dispute.dealTitle}</p>
          </div>
          <StatusBadge status={dispute.status} size="md" />
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Discrepancy summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-surface-50">
            <p className="text-xs text-surface-500 mb-1">Expected</p>
            <p className="text-lg font-bold text-surface-900">{dispute.expected?.quantity} units</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-brand-50">
            <p className="text-xs text-surface-500 mb-1">Buyer Claim</p>
            <p className="text-lg font-bold text-brand-700">{dispute.buyerClaim?.quantity} units</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-warning-50">
            <p className="text-xs text-surface-500 mb-1">Seller Claim</p>
            <p className="text-lg font-bold text-warning-700">{dispute.sellerClaim?.quantity} units</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-danger-50">
            <p className="text-xs text-surface-500 mb-1">Difference</p>
            <p className="text-lg font-bold text-danger-600">{dispute.difference?.quantity} units</p>
          </div>
        </div>

        {/* Disputed amount */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-surface-900 text-white">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-warning-400" />
            <div>
              <p className="text-xs text-surface-400">Disputed Amount</p>
              <p className="text-xl font-bold">{formatCurrency(dispute.disputedAmount)}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-warning-500/20 text-warning-400 text-xs font-semibold">
            {dispute.lockedStatus}
          </span>
        </div>

        {/* Statements */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Statements
          </h4>

          {dispute.buyerClaim?.statement && (
            <div className="p-3 rounded-lg bg-brand-50/50 border border-brand-100">
              <p className="text-xs font-semibold text-brand-700 mb-1">Buyer Statement</p>
              <p className="text-sm text-surface-700">{dispute.buyerClaim.statement}</p>
            </div>
          )}

          {dispute.sellerClaim?.statement && (
            <div className="p-3 rounded-lg bg-warning-50/50 border border-warning-100">
              <p className="text-xs font-semibold text-warning-700 mb-1">Seller Statement</p>
              <p className="text-sm text-surface-700">{dispute.sellerClaim.statement}</p>
            </div>
          )}
        </div>

        {/* AI Summary */}
        {dispute.aiSummary && (
          <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center">
                <Bot className="w-3 h-3 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold text-indigo-700">AI Dispute Summary</span>
            </div>
            <p className="text-sm text-surface-700">{dispute.aiSummary}</p>
            <p className="text-[10px] text-surface-400 mt-2 italic">
              AI analysis is advisory. Final resolution requires human judgment.
            </p>
          </div>
        )}

        {/* Timeline */}
        {dispute.timeline?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-surface-900 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              Timeline
            </h4>
            <div className="space-y-2">
              {dispute.timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-surface-300 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-surface-700">{item.event}</p>
                    <p className="text-xs text-surface-400">
                      {new Date(item.date).toLocaleString()} · {item.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
