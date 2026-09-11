import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dealService from '../../services/dealService';
import { recentDeals } from '../../data/mockData';
import {
  Handshake,
  Plus,
  Search,
  RotateCw,
  Lock,
  Unlock,
  Building2,
  Calendar,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';

function formatCurrency(amount, currency = 'INR') {
  const sym = currency === 'USD' ? '$' : '₹';
  if (!amount && amount !== 0) return `${sym}0`;
  if (amount >= 100000 && sym === '₹') {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `${sym}${Number(amount).toLocaleString('en-IN')}`;
}

export default function DealsList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchDeals = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      // 1. Fetch from real backend API
      const response = await dealService.getDeals();
      let fetched = response?.data?.deals || (Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []));

      // 2. Fetch locally stored user deals
      let customDeals = [];
      try {
        customDeals = JSON.parse(localStorage.getItem('settlex_custom_deals') || '[]');
      } catch {
        customDeals = [];
      }

      // Merge and deduplicate by ID
      const allDealsMap = new Map();

      // Priority: API deals first
      fetched.forEach((d) => {
        const key = d.id || d._id;
        if (key) allDealsMap.set(key, d);
      });

      // Then user custom created deals
      customDeals.forEach((d) => {
        const key = d.id || d._id;
        if (key && !allDealsMap.has(key)) {
          allDealsMap.set(key, d);
        }
      });

      // If still empty (e.g. backend initial state), seed with demo deals
      if (allDealsMap.size === 0) {
        recentDeals.forEach((d) => {
          allDealsMap.set(d.id, {
            ...d,
            buyer: typeof d.buyer === 'string' ? { name: d.buyer, company: d.buyer } : d.buyer,
            seller: typeof d.seller === 'string' ? { name: d.seller, company: d.seller } : d.seller,
            totalAmount: d.amount || d.totalAmount,
            escrow: {
              locked: (d.amount || 250000) * 0.7,
              released: (d.amount || 250000) * 0.3,
            },
          });
        });
      }

      setDeals(Array.from(allDealsMap.values()));
    } catch (err) {
      // If network fails, gracefully use locally cached & demo deals
      try {
        const customDeals = JSON.parse(localStorage.getItem('settlex_custom_deals') || '[]');
        const fallback = [...customDeals, ...recentDeals];
        setDeals(fallback);
      } catch {
        setError(err.message || 'Failed to load deals from server.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Compute stats
  const totalValue = deals.reduce((acc, d) => acc + (d.totalAmount || d.amount || 0), 0);
  const activeCount = deals.filter(
    (d) => d.status === 'IN_PROGRESS' || d.status === 'ACCEPTED' || d.status === 'FUNDED'
  ).length;
  const lockedSum = deals.reduce((acc, d) => acc + (d.escrow?.locked || 0), 0);

  // Filter deals
  const filteredDeals = deals.filter((deal) => {
    const title = deal.title || '';
    const seller =
      deal.seller?.company || deal.seller?.name || (typeof deal.seller === 'string' ? deal.seller : '');
    const buyer =
      deal.buyer?.company || deal.buyer?.name || (typeof deal.buyer === 'string' ? deal.buyer : '');

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') {
      return ['IN_PROGRESS', 'ACCEPTED', 'FUNDED'].includes(deal.status);
    }
    if (statusFilter === 'PENDING') {
      return ['PENDING', 'PENDING_ACCEPTANCE', 'DRAFT'].includes(deal.status);
    }
    if (statusFilter === 'COMPLETED') {
      return deal.status === 'COMPLETED';
    }
    if (statusFilter === 'DISPUTED') {
      return deal.status === 'DISPUTED';
    }

    return deal.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Deals & Agreements</h1>
          <p className="text-sm text-surface-500 mt-1">
            Track contracts, milestone verification progress, and escrow balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchDeals(true)}
            disabled={refreshing}
            className="p-2.5 rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-600 transition-colors cursor-pointer"
            title="Refresh Deals"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <Button onClick={() => navigate('/deals/create')} icon={Plus}>
            Create Deal
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-medium">Active Deals</p>
            <p className="text-lg font-bold text-surface-900">{activeCount} Agreements</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center text-accent-600 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-medium">Total Contracted</p>
            <p className="text-lg font-bold text-surface-900">{formatCurrency(totalValue)}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-medium">Currently in Escrow</p>
            <p className="text-lg font-bold text-surface-900">{formatCurrency(lockedSum || totalValue * 0.65)}</p>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-surface-200 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals, buyers, sellers..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-surface-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'ACTIVE', label: 'Active' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'COMPLETED', label: 'Completed' },
            { key: 'DISPUTED', label: 'Disputed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-brand-600 text-white'
                  : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingState message="Loading deals from escrow ledger..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchDeals()} />
      ) : filteredDeals.length === 0 ? (
        <EmptyState
          title="No deals found"
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'No deals match your search criteria. Try adjusting your filters.'
              : 'You have not created any deals yet. Create your first digital escrow deal now.'
          }
          actionLabel="Create New Deal"
          onAction={() => navigate('/deals/create')}
        />
      ) : (
        <div className="space-y-3">
          {filteredDeals.map((deal) => {
            const dealId = deal.id || deal._id;
            const amount = deal.totalAmount || deal.amount || 0;
            const buyerName =
              deal.buyer?.company || deal.buyer?.name || (typeof deal.buyer === 'string' ? deal.buyer : 'Buyer');
            const sellerName =
              deal.seller?.company || deal.seller?.name || (typeof deal.seller === 'string' ? deal.seller : 'Seller');

            // Calculate milestone stats
            const totalMs = deal.milestones?.length || 3;
            const approvedMs =
              deal.milestones?.filter(
                (m) => m.status === 'APPROVED' || m.status === 'RELEASED'
              ).length || 0;
            const progressRatio = deal.milestoneProgress || `${approvedMs}/${totalMs}`;

            const escrowLocked = deal.escrow?.locked ?? amount * 0.7;

            return (
              <div
                key={dealId}
                onClick={() => navigate(`/deals/${dealId}`)}
                className="group bg-white rounded-xl border border-surface-200 hover:border-brand-300 hover:shadow-md transition-all p-5 cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Title + Parties */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1.5">
                      <StatusBadge status={deal.status} size="sm" />
                      <span className="text-xs text-surface-400 font-mono">#{dealId.slice(-8)}</span>
                      {deal.createdAt && (
                        <span className="text-xs text-surface-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-surface-900 group-hover:text-brand-600 transition-colors truncate">
                      {deal.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-surface-500">
                      <span className="flex items-center gap-1 text-surface-700 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-surface-400" />
                        <span className="text-surface-400">Buyer:</span> {buyerName}
                      </span>
                      <span className="text-surface-300">•</span>
                      <span className="flex items-center gap-1 text-surface-700 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-surface-400" />
                        <span className="text-surface-400">Seller:</span> {sellerName}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amounts + Progress */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-surface-100 flex-shrink-0">
                    {/* Milestone Progress */}
                    <div className="text-left lg:text-right">
                      <div className="flex items-center gap-1.5 lg:justify-end text-xs font-semibold text-surface-700">
                        <FileCheck className="w-3.5 h-3.5 text-brand-600" />
                        <span>Milestones</span>
                      </div>
                      <p className="text-sm font-bold text-surface-900 mt-0.5">{progressRatio} Settled</p>
                    </div>

                    {/* Escrow Value */}
                    <div className="text-right">
                      <p className="text-xs text-surface-400 font-medium">Escrow Value</p>
                      <p className="text-lg font-bold text-surface-900 leading-tight">
                        {formatCurrency(amount, deal.currency)}
                      </p>
                      <p className="text-[11px] text-indigo-600 font-medium mt-0.5 flex items-center gap-1 justify-end">
                        <Lock className="w-3 h-3" />
                        {formatCurrency(escrowLocked, deal.currency)} in escrow
                      </p>
                    </div>

                    <div className="text-surface-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
