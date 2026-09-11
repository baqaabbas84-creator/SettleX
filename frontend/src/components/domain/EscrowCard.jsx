import { Lock, Unlock, ArrowRight, Info } from 'lucide-react';

function formatCurrency(amount) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatFullCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function EscrowCard({ total, locked, released, refunded = 0, className = '' }) {
  const lockedPercent = total > 0 ? (locked / total) * 100 : 0;
  const releasedPercent = total > 0 ? (released / total) * 100 : 0;
  const refundedPercent = total > 0 ? (refunded / total) * 100 : 0;

  return (
    <div className={`bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Escrow Ledger</h3>
            <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Simulated escrow — prototype demonstration
            </p>
          </div>
          <span className="text-xl font-bold text-surface-900">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 pt-4 pb-3">
        <div className="h-3 rounded-full bg-surface-100 overflow-hidden flex">
          {releasedPercent > 0 && (
            <div
              className="h-full bg-gradient-to-r from-accent-400 to-accent-500 transition-all duration-700 ease-out"
              style={{ width: `${releasedPercent}%` }}
            />
          )}
          {lockedPercent > 0 && (
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-indigo-500 transition-all duration-700 ease-out"
              style={{ width: `${lockedPercent}%` }}
            />
          )}
          {refundedPercent > 0 && (
            <div
              className="h-full bg-gradient-to-r from-warning-400 to-warning-500 transition-all duration-700 ease-out"
              style={{ width: `${refundedPercent}%` }}
            />
          )}
        </div>
      </div>

      {/* Amounts */}
      <div className="px-6 pb-5 grid grid-cols-3 gap-4">
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lock className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-medium">Locked</p>
            <p className="text-sm font-bold text-surface-900">{formatFullCurrency(locked)}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Unlock className="w-3.5 h-3.5 text-accent-600" />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-medium">Released</p>
            <p className="text-sm font-bold text-surface-900">{formatFullCurrency(released)}</p>
          </div>
        </div>

        {refunded > 0 && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-warning-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ArrowRight className="w-3.5 h-3.5 text-warning-600" />
            </div>
            <div>
              <p className="text-xs text-surface-500 font-medium">Refunded</p>
              <p className="text-sm font-bold text-surface-900">{formatFullCurrency(refunded)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
