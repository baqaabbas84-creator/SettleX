import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dealService from '../../services/dealService';
import { recentDeals } from '../../data/mockData';
import {
  Activity,
  Search,
  Building2,
  Calendar,
  Lock,
  Unlock,
  ChevronRight,
  Clock,
  RotateCw,
  FileCheck,
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

export default function ActiveDeals() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DUE_DATE');

  const fetchActiveDeals = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await dealService.getDeals();
      let allDeals = res?.data?.deals || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));

      let customDeals = [];
      try {
        customDeals = JSON.parse(localStorage.getItem('settlex_custom_deals') || '[]');
      } catch {
        customDeals = [];
      }

      const combined = [...customDeals, ...allDeals];

      if (combined.length === 0) {
        combined.push(...recentDeals);
      }

      // Filter to active deals: IN_PROGRESS, ACCEPTED, FUNDED
      const activeOnly = combined.map((d, index) => {
        const total = d.totalAmount || d.amount || 250000;
        const released = d.escrow?.released ?? total * 0.25;
        const locked = d.escrow?.locked ?? total - released;
        const percent = Math.round((released / total) * 100);

        return {
          id: d.id || d._id || `deal_act_${index}`,
          _id: d.id || d._id,
          title: d.title,
          buyer: d.buyer?.company || d.buyer?.name || (typeof d.buyer === 'string' ? d.buyer : 'Kumar Trading Co.'),
          seller: d.seller?.company || d.seller?.name || (typeof d.seller === 'string' ? d.seller : 'Sharma Furniture Works'),
          totalAmount: total,
          lockedAmount: locked,
          releasedAmount: released,
          progressPercent: percent,
          currentMilestone: d.currentMilestone || (percent >= 50 ? 'M2: Batch Production QA' : 'M1: Design Approval'),
          nextDueDate: d.nextDueDate || '2026-09-28',
          status: d.status || 'IN_PROGRESS',
          createdAt: d.createdAt || '2026-09-01',
        };
      });

      setDeals(activeOnly);
    } catch (err) {
      setError(err.message || 'Failed to retrieve active contracts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveDeals();
  }, [fetchActiveDeals]);

  const filteredDeals = deals
    .filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'AMOUNT_DESC') return b.totalAmount - a.totalAmount;
      if (sortBy === 'PROGRESS_DESC') return b.progressPercent - a.progressPercent;
      return new Date(a.nextDueDate) - new Date(b.nextDueDate);
    });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Active Contract Portfolio</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Active Deals</h1>
          <p className="text-sm text-surface-500 mt-1">
            Monitor milestone execution, current delivery schedules, and locked escrow balances.
          </p>
        </div>

        <button
          onClick={() => fetchActiveDeals(true)}
          disabled={refreshing}
          className="p-2 rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-600 transition-colors self-start sm:self-auto cursor-pointer"
          title="Refresh"
        >
          <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active deals, parties..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white"
          >
            <option value="ALL">All Active Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="FUNDED">Funded & Locked</option>
            <option value="ACCEPTED">Accepted</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white"
          >
            <option value="DUE_DATE">Upcoming Due Date</option>
            <option value="PROGRESS_DESC">Highest Progress</option>
            <option value="AMOUNT_DESC">Highest Amount</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading active contracts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchActiveDeals()} />
      ) : filteredDeals.length === 0 ? (
        <EmptyState
          title="No active deals right now"
          description="Create a deal or accept incoming proposals to start settling milestones."
          actionLabel="Create Deal"
          onAction={() => navigate('/deals/create')}
        />
      ) : (
        <div className="space-y-4">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => navigate(`/deals/${deal.id}`)}
              className="bg-white rounded-xl border border-surface-200 hover:border-brand-300 hover:shadow-md transition-all p-5 cursor-pointer group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <StatusBadge status={deal.status} size="xs" />
                    <span className="text-xs text-surface-400 font-mono">#{deal.id.slice(-8)}</span>
                    <span className="text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Next Due: {deal.nextDueDate}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-surface-900 group-hover:text-brand-600 transition-colors">
                    {deal.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-surface-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-surface-400" />
                      Buyer: <strong className="text-surface-800">{deal.buyer}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-surface-400" />
                      Seller: <strong className="text-surface-800">{deal.seller}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-surface-700 font-medium">
                      <FileCheck className="w-3.5 h-3.5 text-brand-600" />
                      Active: {deal.currentMilestone}
                    </span>
                  </div>

                  {/* Visual Milestone Progress Bar */}
                  <div className="mt-4 max-w-lg">
                    <div className="flex justify-between text-xs text-surface-600 mb-1">
                      <span>Milestone Progress</span>
                      <span className="font-bold text-surface-900">{deal.progressPercent}% Completed</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-100 overflow-hidden flex">
                      <div
                        className="h-full bg-accent-500 transition-all duration-500"
                        style={{ width: `${deal.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right amounts */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-surface-100 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-surface-400 font-medium">Total Contracted</p>
                    <p className="text-lg font-bold text-surface-900 font-mono">
                      {formatCurrency(deal.totalAmount)}
                    </p>
                    <div className="flex items-center justify-end gap-3 mt-1 text-[11px]">
                      <span className="text-indigo-600 font-medium flex items-center gap-0.5">
                        <Lock className="w-3 h-3" />
                        {formatCurrency(deal.lockedAmount)} locked
                      </span>
                      <span className="text-accent-600 font-medium flex items-center gap-0.5">
                        <Unlock className="w-3 h-3" />
                        {formatCurrency(deal.releasedAmount)} released
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-surface-50 group-hover:bg-brand-50 text-surface-400 group-hover:text-brand-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
