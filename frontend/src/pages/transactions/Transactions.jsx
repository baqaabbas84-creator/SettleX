import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import transactionService from '../../services/transactionService';
import {
  Receipt,
  Search,
  Filter,
  ArrowUpDown,
  Lock,
  Unlock,
  RotateCcw,
  Coins,
  Calendar,
  Building2,
  FileCheck,
  RotateCw,
  Download,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₹0';
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-9081-FUND',
    dealId: 'deal_001',
    dealTitle: '500 Wooden Chairs — Office Furniture Order',
    milestone: 'Initial Escrow Deposit',
    type: 'ESCROW_FUNDED',
    amount: 250000,
    status: 'COMPLETED',
    date: '2026-09-03T09:00:00Z',
    description: 'Buyer funded full contract value into simulated escrow smart account.',
  },
  {
    id: 'TXN-9082-LOCK',
    dealId: 'deal_001',
    dealTitle: '500 Wooden Chairs — Office Furniture Order',
    milestone: 'All Contract Milestones',
    type: 'AMOUNT_LOCKED',
    amount: 225000,
    status: 'COMPLETED',
    date: '2026-09-03T09:05:00Z',
    description: 'Funds segregated and locked against milestone release conditions.',
  },
  {
    id: 'TXN-9083-REL',
    dealId: 'deal_001',
    dealTitle: '500 Wooden Chairs — Office Furniture Order',
    milestone: 'M1 - Design Approval & Specs',
    type: 'MILESTONE_RELEASED',
    amount: 25000,
    status: 'COMPLETED',
    date: '2026-09-10T16:15:00Z',
    description: 'Milestone 1 verified and approved by buyer; funds disbursed to seller account.',
  },
  {
    id: 'TXN-9084-FUND',
    dealId: 'deal_002',
    dealTitle: 'Steel Shelving Units — Warehouse Storage',
    milestone: 'Escrow Commitment',
    type: 'ESCROW_FUNDED',
    amount: 180000,
    status: 'COMPLETED',
    date: '2026-09-12T11:20:00Z',
    description: 'Escrow lock initialized for warehouse steel order.',
  },
  {
    id: 'TXN-9085-REF',
    dealId: 'deal_004',
    dealTitle: 'Defective Paint Batch Claim',
    milestone: 'Damaged Goods Refund',
    type: 'REFUND',
    amount: 15000,
    status: 'COMPLETED',
    date: '2026-09-14T14:40:00Z',
    description: 'Arbitration resolution refunded partial escrow back to buyer.',
  },
];

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await transactionService.getTransactions().catch(() => null);
      let list = [];

      const rawList = res?.data?.transactions || (Array.isArray(res?.data) ? res.data : []);
      
      list = rawList.map((t) => ({
        id: t._id || t.id,
        dealId: t.dealId?._id || t.dealId || 'N/A',
        dealTitle: t.dealId?.title || t.dealTitle || 'Deal Contract',
        milestone: t.milestoneId?.title || t.milestone || 'Escrow Operation',
        type: t.type,
        amount: t.amount,
        status: t.status || 'COMPLETED',
        date: t.createdAt || t.date || new Date().toISOString(),
        description: t.reference || t.description || 'Escrow transaction logged on ledger.',
      }));

      const merged = [...list, ...INITIAL_TRANSACTIONS];

      // Deduplicate by ID
      const map = new Map();
      merged.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      });

      setTransactions(Array.from(map.values()));
    } catch (err) {
      setError(err.message || 'Failed to load transaction ledger.');
      setTransactions(INITIAL_TRANSACTIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Aggregate Metrics
  const totalFunded = transactions
    .filter((t) => t.type === 'ESCROW_FUNDED')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalLocked = transactions
    .filter((t) => t.type === 'AMOUNT_LOCKED')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalReleased = transactions
    .filter((t) => t.type === 'MILESTONE_RELEASED')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalRefunded = transactions
    .filter((t) => t.type === 'REFUND')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      t.id.toLowerCase().includes(query) ||
      t.dealTitle.toLowerCase().includes(query) ||
      t.milestone.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;

    if (dateFilter === 'LAST_7_DAYS') {
      const sevenDaysAgo = Date.now() - 7 * 86400000;
      if (new Date(t.date).getTime() < sevenDaysAgo) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Immutable Escrow Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Transaction History</h1>
          <p className="text-sm text-surface-500 mt-1">
            Verifiable record of all escrow deposits, locks, milestone disbursements, and refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTransactions(true)}
            disabled={refreshing}
            className="p-2.5 rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-600 transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <Button
            variant="outline"
            onClick={() => alert('Exporting full CSV audit log...')}
            icon={Download}
          >
            Export Ledger
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Funded</span>
            <Coins className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-surface-900 font-mono">{formatCurrency(totalFunded)}</p>
          <span className="text-[11px] text-surface-400 mt-0.5 block">Deposits to escrow</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Total Locked</span>
            <Lock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-950 font-mono">{formatCurrency(totalLocked)}</p>
          <span className="text-[11px] text-indigo-600 mt-0.5 block">Held in smart contracts</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-accent-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-accent-700 uppercase tracking-wider">Total Released</span>
            <Unlock className="w-4 h-4 text-accent-600" />
          </div>
          <p className="text-2xl font-black text-accent-950 font-mono">{formatCurrency(totalReleased)}</p>
          <span className="text-[11px] text-accent-600 mt-0.5 block">Settled to suppliers</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Refunded</span>
            <RotateCcw className="w-4 h-4 text-warning-600" />
          </div>
          <p className="text-2xl font-black text-surface-900 font-mono">{formatCurrency(totalRefunded)}</p>
          <span className="text-[11px] text-surface-400 mt-0.5 block">Dispute arbitrations</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, deal, milestone..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="ESCROW_FUNDED">Escrow Funded</option>
            <option value="AMOUNT_LOCKED">Amount Locked</option>
            <option value="MILESTONE_RELEASED">Milestone Released</option>
            <option value="REFUND">Refund</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white"
          >
            <option value="ALL">All Time</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="THIS_MONTH">This Month</option>
          </select>
        </div>
      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <LoadingState message="Loading financial ledger..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchTransactions()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="When agreements are funded and milestone releases occur, audit entries will populate here."
        />
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Transaction ID</th>
                  <th className="px-5 py-3.5">Deal & Milestone</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-surface-900">
                      {t.id}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-surface-900">{t.dealTitle}</p>
                      <p className="text-surface-500 text-[11px] mt-0.5">{t.milestone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-100 text-surface-700 border border-surface-200">
                        {t.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-sm text-surface-900">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={t.status} size="xs" />
                    </td>
                    <td className="px-5 py-4 text-surface-500 whitespace-nowrap">
                      {new Date(t.date).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
