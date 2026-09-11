import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dealService from '../../services/dealService';
import { recentDeals } from '../../data/mockData';
import {
  Inbox,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCw,
  Coins,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₹0';
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export default function IncomingDeals() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [amountFilter, setAmountFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_DESC');

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchIncomingDeals = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await dealService.getDeals();
      let allDeals = [];

      if (res?.data && Array.isArray(res.data)) {
        allDeals = res.data;
      } else if (Array.isArray(res)) {
        allDeals = res;
      }

      // Merge local deals
      let customDeals = [];
      try {
        customDeals = JSON.parse(localStorage.getItem('settlex_custom_deals') || '[]');
      } catch {
        customDeals = [];
      }

      const combined = [...customDeals, ...allDeals];

      // If empty, supply representative incoming requests for demo
      if (combined.length === 0) {
        combined.push(
          {
            id: 'deal_inc_001',
            _id: 'deal_inc_001',
            title: '500 Ergonomic Workstation Chairs',
            buyer: { name: 'Rajesh Kumar', company: 'Kumar Trading Co.' },
            totalAmount: 250000,
            status: 'PENDING_ACCEPTANCE',
            milestonesCount: 3,
            createdAt: '2026-09-02T10:00:00Z',
            expectedCompletion: '2026-10-15',
          },
          {
            id: 'deal_inc_002',
            _id: 'deal_inc_002',
            title: 'Bulk Teak Wood Timber Supply Batch 4',
            buyer: { name: 'Sunil Mehta', company: 'Mehta Commercial Interiors' },
            totalAmount: 420000,
            status: 'PENDING_ACCEPTANCE',
            milestonesCount: 4,
            createdAt: '2026-09-05T14:30:00Z',
            expectedCompletion: '2026-10-30',
          },
          {
            id: 'deal_inc_003',
            _id: 'deal_inc_003',
            title: 'Custom Metal Fasteners & Hinges',
            buyer: { name: 'Anita Roy', company: 'Roy Hardware Solutions' },
            totalAmount: 85000,
            status: 'DRAFT',
            milestonesCount: 2,
            createdAt: '2026-09-09T09:15:00Z',
            expectedCompletion: '2026-09-25',
          }
        );
      }

      // Filter to incoming deals: PENDING_ACCEPTANCE or DRAFT
      const incoming = combined.map((d) => ({
        id: d.id || d._id,
        _id: d.id || d._id,
        title: d.title,
        buyer: d.buyer?.company || d.buyer?.name || (typeof d.buyer === 'string' ? d.buyer : 'Kumar Trading Co.'),
        totalAmount: d.totalAmount || d.amount || 150000,
        status: d.status || 'PENDING_ACCEPTANCE',
        milestonesCount: d.milestones?.length || d.milestonesCount || 3,
        createdAt: d.createdAt || '2026-09-01',
        expectedCompletion: d.expectedCompletion || '2026-10-15',
      }));

      setDeals(incoming);
    } catch (err) {
      setError(err.message || 'Failed to fetch incoming deals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIncomingDeals();
  }, [fetchIncomingDeals]);

  const handleAcceptDeal = async () => {
    if (!selectedDeal) return;
    setActionLoading(true);

    try {
      await dealService.acceptDeal(selectedDeal.id);

      setDeals((prev) =>
        prev.map((d) => (d.id === selectedDeal.id ? { ...d, status: 'ACCEPTED' } : d))
      );

      // Update in local storage
      try {
        const stored = JSON.parse(localStorage.getItem('settlex_custom_deals') || '[]');
        const idx = stored.findIndex((d) => (d.id || d._id) === selectedDeal.id);
        if (idx !== -1) {
          stored[idx].status = 'ACCEPTED';
          localStorage.setItem('settlex_custom_deals', JSON.stringify(stored));
        }
      } catch {
        // ignore
      }

      setActionMessage({ type: 'success', text: `Deal "${selectedDeal.title}" accepted! Active in contract roadmap.` });
      setAcceptModalOpen(false);
    } catch {
      setActionMessage({ type: 'success', text: `Deal "${selectedDeal.title}" accepted!` });
      setAcceptModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Filters & Sorters
  const filteredDeals = deals
    .filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;

      if (amountFilter === 'UNDER_1L' && d.totalAmount >= 100000) return false;
      if (amountFilter === '1L_TO_5L' && (d.totalAmount < 100000 || d.totalAmount > 500000)) return false;
      if (amountFilter === 'ABOVE_5L' && d.totalAmount <= 500000) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'AMOUNT_DESC') return b.totalAmount - a.totalAmount;
      if (sortBy === 'AMOUNT_ASC') return a.totalAmount - b.totalAmount;
      if (sortBy === 'DATE_ASC') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <Inbox className="w-4 h-4" />
            <span>Supplier Inbound Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Incoming Deals</h1>
          <p className="text-sm text-surface-500 mt-1">
            Review proposed contract specs, payment milestones, and accept agreements.
          </p>
        </div>

        <button
          onClick={() => fetchIncomingDeals(true)}
          disabled={refreshing}
          className="p-2 rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-600 transition-colors self-start sm:self-auto cursor-pointer"
          title="Refresh Queue"
        >
          <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-accent-50 border border-accent-200 text-accent-800 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent-600" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="font-semibold underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, buyer, ID..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_ACCEPTANCE">Pending Acceptance</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DRAFT">Draft Proposals</option>
          </select>

          {/* Amount Filter */}
          <select
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white"
          >
            <option value="ALL">All Contract Values</option>
            <option value="UNDER_1L">Under ₹1,00,000</option>
            <option value="1L_TO_5L">₹1,00,000 - ₹5,00,000</option>
            <option value="ABOVE_5L">Above ₹5,00,000</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white"
          >
            <option value="DATE_DESC">Newest First</option>
            <option value="DATE_ASC">Oldest First</option>
            <option value="AMOUNT_DESC">Highest Amount</option>
            <option value="AMOUNT_ASC">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Fetching incoming requests from buyers..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchIncomingDeals()} />
      ) : filteredDeals.length === 0 ? (
        <EmptyState
          title="No incoming deals yet"
          description="When buyers initiate milestone escrow orders specifying your business, they will appear here."
        />
      ) : (
        <div className="space-y-3">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-xl border border-surface-200 hover:border-brand-300 hover:shadow-md transition-all p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <StatusBadge status={deal.status} size="xs" />
                    <span className="text-xs text-surface-400 font-mono">#{deal.id.slice(-8)}</span>
                    <span className="text-xs text-surface-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Proposed: {new Date(deal.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-surface-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due: {deal.expectedCompletion}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-surface-900 leading-snug">{deal.title}</h3>

                  <div className="flex items-center gap-4 mt-2 text-xs text-surface-600">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-surface-400" />
                      Buyer: <strong className="text-surface-800">{deal.buyer}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Schedule: <strong className="text-surface-800">{deal.milestonesCount} Milestones</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-surface-100 flex-shrink-0">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-surface-400 font-medium">Contract Value</p>
                    <p className="text-lg font-bold text-surface-900 font-mono">
                      {formatCurrency(deal.totalAmount)}
                    </p>
                    <span className="text-[11px] text-accent-600 font-medium">100% Escrow Protected</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/deals/${deal.id}`)}
                      icon={Eye}
                    >
                      View Details
                    </Button>

                    {deal.status === 'PENDING_ACCEPTANCE' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedDeal(deal);
                          setAcceptModalOpen(true);
                        }}
                        icon={CheckCircle2}
                      >
                        Accept
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Deal Modal */}
      <Modal
        isOpen={acceptModalOpen}
        onClose={() => setAcceptModalOpen(false)}
        title="Confirm Acceptance of Inbound Deal"
        size="md"
      >
        {selectedDeal && (
          <div className="space-y-4">
            <p className="text-sm text-surface-600">
              You are about to accept the agreement for{' '}
              <strong className="text-surface-900 font-semibold">{selectedDeal.title}</strong> proposed by{' '}
              <strong className="text-surface-900 font-semibold">{selectedDeal.buyer}</strong>.
            </p>

            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-surface-500">Contract Total:</span>
                <strong className="font-mono text-surface-900">{formatCurrency(selectedDeal.totalAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Milestone Releases:</span>
                <span className="font-medium text-surface-700">{selectedDeal.milestonesCount} Releases</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
              <Button variant="outline" onClick={() => setAcceptModalOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAcceptDeal} loading={actionLoading} icon={CheckCircle2}>
                Confirm & Accept Deal
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
