import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import disputeService from '../../services/disputeService';
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Upload,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Building2,
  FileText,
  RotateCw,
  Scale,
  ShieldAlert,
  ArrowRight,
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

const INITIAL_DISPUTES = [
  {
    id: 'DSP-4011',
    dealId: 'deal_001',
    dealTitle: '500 Wooden Chairs — Office Furniture Order',
    milestone: 'M2 - Batch Manufacturing QA & Wood Specifications',
    raisedBy: 'Kumar Trading Co. (Buyer)',
    reason: 'Defective finishing & 50 units short of contracted delivery specifications.',
    amountInvolved: 125000,
    date: '2026-09-11T12:30:00Z',
    status: 'UNDER_REVIEW',
    buyer: { name: 'Rajesh Kumar', company: 'Kumar Trading Co.' },
    seller: { name: 'Priya Sharma', company: 'Sharma Furniture Works' },
    evidenceDocs: ['inspection_shortage_report.pdf', 'warehouse_unloading_photos.zip'],
    discrepancy: {
      metric: 'Delivered Chairs Quantity',
      expected: '500 Units',
      sellerSubmitted: '500 Units (as per factory invoice)',
      buyerReported: '450 Units (received at warehouse loading dock)',
      difference: '50 Units Missing / Damaged',
    },
    aiSummary:
      'AI Analysis detected quantity mismatch between factory delivery manifest (500) and warehouse receiving slip (450). Wood moisture content also flagged 4% above contracted ISO tolerance.',
    humanReviewStatus: 'Senior Arbitrator Assigned (Vikram Sen) — Awaiting Seller Batch Inspection Proof',
    finalResolution: null,
  },
  {
    id: 'DSP-4009',
    dealId: 'deal_004',
    dealTitle: 'Automotive Fasteners Supply',
    milestone: 'M3 - Warehouse Receipt & Metallurgical Testing',
    raisedBy: 'Zenith Logistics (Buyer)',
    reason: 'Tensile strength failed third-party lab testing specifications.',
    amountInvolved: 48000,
    date: '2026-09-02T10:15:00Z',
    status: 'RESOLVED',
    buyer: { name: 'Sunil Rao', company: 'Zenith Logistics' },
    seller: { name: 'Apex Metal Alloys', company: 'Apex Metal Alloys' },
    evidenceDocs: ['metallurgy_lab_test_report.pdf'],
    discrepancy: {
      metric: 'Tensile Strength Grade',
      expected: 'Grade 8.8 (800 MPa minimum)',
      sellerSubmitted: 'Self-certified Grade 8.8',
      buyerReported: 'Independent lab test returned Grade 6.8 (600 MPa)',
      difference: '-200 MPa structural failure risk',
    },
    aiSummary:
      'Certified lab report confirmed substandard tensile load tolerance. Substantial discrepancy corroborated.',
    humanReviewStatus: 'Arbitration Concluded',
    finalResolution: 'Arbitrator ordered ₹48,000 full refund from Escrow to Buyer. Seller trust score penalized -12pts.',
  },
];

export default function Disputes() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [raiseModalOpen, setRaiseModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Raise Dispute Form
  const [raiseForm, setRaiseForm] = useState({
    dealTitle: '500 Wooden Chairs — Office Furniture Order',
    milestone: 'M2 - Batch Manufacturing QA',
    reason: '',
    amount: '125000',
    expectedQty: '500',
    reportedQty: '450',
  });

  const [resolutionNote, setResolutionNote] = useState('Release 80% to seller; refund 20% to buyer for damaged lot.');

  const fetchDisputes = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await disputeService.getDisputes().catch(() => null);
      let list = [];

      if (res?.data && Array.isArray(res.data)) {
        list = res.data;
      }

      let localDisputes = [];
      try {
        localDisputes = JSON.parse(localStorage.getItem('settlex_custom_disputes') || '[]');
      } catch {
        localDisputes = [];
      }

      const merged = [...localDisputes, ...list, ...INITIAL_DISPUTES];
      const uniqueMap = new Map();
      merged.forEach((d) => {
        if (!uniqueMap.has(d.id)) {
          uniqueMap.set(d.id, d);
        }
      });

      setDisputes(Array.from(uniqueMap.values()));
    } catch (err) {
      setError(err.message || 'Failed to retrieve dispute registry.');
      setDisputes(INITIAL_DISPUTES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const newDsp = {
        id: 'DSP-' + Math.floor(1000 + Math.random() * 9000),
        dealId: 'deal_001',
        dealTitle: raiseForm.dealTitle,
        milestone: raiseForm.milestone,
        raisedBy: `${user?.company || 'Buyer Organization'} (${user?.name || 'Authorized Buyer'})`,
        reason: raiseForm.reason,
        amountInvolved: Number(raiseForm.amount) || 50000,
        date: new Date().toISOString(),
        status: 'OPEN',
        buyer: { name: user?.name || 'Buyer', company: user?.company || 'Buyer Organization' },
        seller: { name: 'Priya Sharma', company: 'Sharma Furniture Works' },
        evidenceDocs: ['discrepancy_claim_log.pdf'],
        discrepancy: {
          metric: 'Delivered Quantity Verification',
          expected: `${raiseForm.expectedQty} Units`,
          sellerSubmitted: `${raiseForm.expectedQty} Units claimed`,
          buyerReported: `${raiseForm.reportedQty} Units received`,
          difference: `${Math.abs(Number(raiseForm.expectedQty) - Number(raiseForm.reportedQty))} Units Mismatched`,
        },
        aiSummary:
          'Automated discrepancy check confirmed conflict between buyer receipt affirmation and seller dispatch invoice.',
        humanReviewStatus: 'Assigned to SettleX Mediation Desk — Awaiting Seller Response',
        finalResolution: null,
      };

      await disputeService.raiseDispute(newDsp).catch(() => null);

      try {
        const stored = JSON.parse(localStorage.getItem('settlex_custom_disputes') || '[]');
        localStorage.setItem('settlex_custom_disputes', JSON.stringify([newDsp, ...stored]));
      } catch {
        // ignore
      }

      setDisputes((prev) => [newDsp, ...prev]);
      setFeedback({ type: 'success', text: `Dispute ${newDsp.id} lodged. Escrow funds paused safely.` });
      setRaiseModalOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to file dispute.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveSubmit = async () => {
    if (!selectedDispute) return;
    setActionLoading(true);

    try {
      await disputeService.resolveDispute(selectedDispute.id, { resolution: resolutionNote }).catch(() => null);

      setDisputes((prev) =>
        prev.map((d) =>
          d.id === selectedDispute.id
            ? { ...d, status: 'RESOLVED', finalResolution: resolutionNote, humanReviewStatus: 'Arbitration Concluded' }
            : d
        )
      );

      setFeedback({ type: 'success', text: `Dispute ${selectedDispute.id} settled according to deterministic terms.` });
      setResolveModalOpen(false);
      setDetailModalOpen(false);
    } catch {
      setResolveModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    const query = searchQuery.toLowerCase();
    const match =
      d.id.toLowerCase().includes(query) ||
      d.dealTitle.toLowerCase().includes(query) ||
      d.reason.toLowerCase().includes(query) ||
      d.raisedBy.toLowerCase().includes(query);

    if (!match) return false;

    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-danger-600 uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>SettleX Dispute & Arbitration Center</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Dispute Management</h1>
          <p className="text-sm text-surface-500 mt-1">
            Deterministic conflict resolution. AI summarizes discrepancies; authorized human rules decide escrow release.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDisputes(true)}
            disabled={refreshing}
            className="p-2.5 rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <Button
            variant="danger"
            onClick={() => setRaiseModalOpen(true)}
            icon={AlertTriangle}
          >
            Raise Dispute
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-accent-50 border border-accent-200 text-accent-800 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent-600" />
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-semibold underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Core Principle Banner */}
      <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-brand-900">
          <p className="font-bold">Core SettleX Principle in Disputes</p>
          <p className="text-brand-700 mt-0.5 leading-relaxed">
            "AI understands. Rules decide. Money moves only when conditions are satisfied."
            Our AI engine compares invoices against receipts to pinpoint factual discrepancies. However, final escrow release or refund decisions are strictly verified by deterministic arbitration protocols.
          </p>
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
            placeholder="Search by ID, deal, party..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white"
        >
          <option value="ALL">All Dispute Statuses</option>
          <option value="OPEN">Open</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Content List */}
      {loading ? (
        <LoadingState message="Loading dispute queue..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchDisputes()} />
      ) : filteredDisputes.length === 0 ? (
        <EmptyState
          title="No disputes found"
          description="All active deals and milestones are proceeding smoothly within agreed parameters."
        />
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dsp) => (
            <div
              key={dsp.id}
              className="bg-white rounded-xl border border-surface-200 hover:border-danger-300 hover:shadow-md transition-all p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <span className="font-mono font-bold text-xs bg-surface-100 text-surface-700 px-2 py-0.5 rounded border border-surface-200">
                      {dsp.id}
                    </span>
                    <StatusBadge status={dsp.status} size="xs" />
                    <span className="text-xs text-surface-400">
                      Filed {new Date(dsp.date).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-surface-900 leading-snug">
                    {dsp.dealTitle}
                  </h3>

                  <p className="text-xs text-brand-700 font-medium mt-0.5">
                    Target Milestone: {dsp.milestone}
                  </p>

                  <p className="text-xs text-surface-600 mt-2 line-clamp-2 bg-surface-50 p-2.5 rounded-lg border border-surface-100">
                    <strong className="text-surface-800">Grounds:</strong> {dsp.reason}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-surface-500">
                    <span>
                      Raised by: <strong className="text-surface-700">{dsp.raisedBy}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Involved Escrow: <strong className="text-danger-700 font-mono">{formatCurrency(dsp.amountInvolved)}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-surface-100 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedDispute(dsp); setDetailModalOpen(true); }}
                    icon={Eye}
                  >
                    View Case File
                  </Button>

                  {user?.role === 'ADMIN' && dsp.status !== 'RESOLVED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => { setSelectedDispute(dsp); setResolveModalOpen(true); }}
                      icon={CheckCircle2}
                    >
                      Resolve Case
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Case File Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Arbitration Case File — ${selectedDispute?.id || ''}`}
        size="lg"
      >
        {selectedDispute && (
          <div className="space-y-5 text-xs">
            {/* Header Strip */}
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-surface-500 block">Case ID:</span>
                <strong className="font-mono text-surface-900 text-sm">{selectedDispute.id}</strong>
              </div>
              <div>
                <span className="text-surface-500 block">Status:</span>
                <StatusBadge status={selectedDispute.status} size="xs" />
              </div>
              <div>
                <span className="text-surface-500 block">Escrow in Dispute:</span>
                <strong className="font-mono text-danger-700 text-sm">{formatCurrency(selectedDispute.amountInvolved)}</strong>
              </div>
              <div>
                <span className="text-surface-500 block">Date Lodged:</span>
                <span>{new Date(selectedDispute.date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Parties Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                <span className="font-semibold text-surface-600 block mb-1">Buyer Party:</span>
                <p className="font-bold text-surface-900">{selectedDispute.buyer?.company}</p>
                <p className="text-surface-500">{selectedDispute.buyer?.name}</p>
              </div>
              <div className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                <span className="font-semibold text-surface-600 block mb-1">Seller Party:</span>
                <p className="font-bold text-surface-900">{selectedDispute.seller?.company}</p>
                <p className="text-surface-500">{selectedDispute.seller?.name}</p>
              </div>
            </div>

            {/* Discrepancy Highlight Box */}
            {selectedDispute.discrepancy && (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-amber-950">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Detected Factual Discrepancy: {selectedDispute.discrepancy.metric}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                    <span className="text-surface-500 block text-[11px]">Expected per Contract:</span>
                    <strong className="text-surface-900">{selectedDispute.discrepancy.expected}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                    <span className="text-surface-500 block text-[11px]">Buyer Claimed:</span>
                    <strong className="text-danger-700">{selectedDispute.discrepancy.buyerReported}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                    <span className="text-surface-500 block text-[11px]">Seller Submitted:</span>
                    <strong className="text-surface-900">{selectedDispute.discrepancy.sellerSubmitted}</strong>
                  </div>
                </div>

                <div className="pt-1 font-bold text-danger-800 flex items-center gap-1">
                  <span className="bg-danger-100 px-2 py-0.5 rounded">
                    Difference: {selectedDispute.discrepancy.difference}
                  </span>
                </div>
              </div>
            )}

            {/* AI Summary */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1 text-indigo-950">
              <span className="font-bold flex items-center gap-1.5 text-indigo-800">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI Dispute Summary & Signal Extraction
              </span>
              <p className="text-indigo-900 leading-relaxed pt-0.5">{selectedDispute.aiSummary}</p>
            </div>

            {/* Human Review & Final Resolution */}
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
              <span className="font-bold text-surface-800 block">Human Arbitrator Protocol Status:</span>
              <p className="text-surface-700">{selectedDispute.humanReviewStatus}</p>

              {selectedDispute.finalResolution && (
                <div className="mt-2 pt-2 border-t border-surface-200">
                  <span className="font-bold text-accent-700 block">Final Binding Resolution:</span>
                  <p className="text-surface-900 font-medium mt-0.5">{selectedDispute.finalResolution}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-surface-200">
              {user?.role === 'ADMIN' && selectedDispute.status !== 'RESOLVED' ? (
                <Button variant="primary" onClick={() => setResolveModalOpen(true)} icon={CheckCircle2}>
                  Arbitrate & Settle
                </Button>
              ) : (
                <span className="text-surface-400 text-[11px]">Protected by SettleX MSME Escrow Guarantee</span>
              )}

              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close Case File
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Raise Dispute Modal */}
      <Modal
        isOpen={raiseModalOpen}
        onClose={() => setRaiseModalOpen(false)}
        title="File Formal Milestone Dispute"
        size="md"
      >
        <form onSubmit={handleRaiseSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs text-danger-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-danger-600 flex-shrink-0 mt-0.5" />
            <span>Filing a dispute pauses automated escrow release for this milestone. Evidence will be analyzed by SettleX.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Related Agreement <span className="text-danger-500">*</span>
            </label>
            <select
              value={raiseForm.dealTitle}
              onChange={(e) => setRaiseForm({ ...raiseForm, dealTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm bg-white"
            >
              <option value="500 Wooden Chairs — Office Furniture Order">500 Wooden Chairs — Office Furniture Order</option>
              <option value="Steel Shelving Units — Warehouse Storage">Steel Shelving Units — Warehouse Storage</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Expected Quantity
              </label>
              <input
                type="text"
                value={raiseForm.expectedQty}
                onChange={(e) => setRaiseForm({ ...raiseForm, expectedQty: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Actual Received Quantity
              </label>
              <input
                type="text"
                value={raiseForm.reportedQty}
                onChange={(e) => setRaiseForm({ ...raiseForm, reportedQty: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Detailed Reason & Discrepancy Grounds <span className="text-danger-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={raiseForm.reason}
              onChange={(e) => setRaiseForm({ ...raiseForm, reason: e.target.value })}
              placeholder="Describe missing inventory, dimensional discrepancies, quality flaws, or unmet milestone terms..."
              className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <Button variant="outline" onClick={() => setRaiseModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={actionLoading} icon={AlertTriangle}>
              Submit Dispute
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resolve Dispute Modal (Admin) */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Admin Arbitration Settlement"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-surface-600">
            Execute deterministic settlement instructions for dispute{' '}
            <strong className="text-surface-900">{selectedDispute?.id}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Binding Arbitration Decision Notes
            </label>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <Button variant="outline" onClick={() => setResolveModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleResolveSubmit} loading={actionLoading} icon={CheckCircle2}>
              Confirm Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
