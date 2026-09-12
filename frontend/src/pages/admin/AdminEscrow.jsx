import { Lock, Unlock, ArrowRight, ShieldCheck, Activity, DollarSign, RotateCw, AlertTriangle } from 'lucide-react';
import EscrowCard from '../../components/domain/EscrowCard';

export default function AdminEscrow() {
  const platformEscrow = {
    total: 34200000, // ₹3.42 Cr
    locked: 14800000,
    released: 18900000,
    refunded: 500000,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
          <Lock className="w-4 h-4" />
          <span>Institutional Liquidity Audit</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Platform Escrow Overview</h1>
        <p className="text-sm text-surface-500 mt-1">
          Simulated master ledger overseeing all MSME locked funds, disbursements, and smart contract liquidity.
        </p>
      </div>

      <EscrowCard
        total={platformEscrow.total}
        locked={platformEscrow.locked}
        released={platformEscrow.released}
        refunded={platformEscrow.refunded}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-surface-200 shadow-xs">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Active Deals in Escrow</span>
          <p className="text-2xl font-bold text-surface-900 mt-1 font-mono">142 Deals</p>
          <span className="text-xs text-accent-600 mt-1 block">Zero unauthorized leakage</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-surface-200 shadow-xs">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Dispute Reserve</span>
          <p className="text-2xl font-bold text-danger-700 mt-1 font-mono">₹8,40,000</p>
          <span className="text-xs text-danger-600 mt-1 block">Held pending arbitration</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-surface-200 shadow-xs">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Settlement Speed</span>
          <p className="text-2xl font-bold text-surface-900 mt-1 font-mono">Instant (T+0)</p>
          <span className="text-xs text-brand-600 mt-1 block">Upon buyer milestone signoff</span>
        </div>
      </div>
    </div>
  );
}
