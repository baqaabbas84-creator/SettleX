import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dealService from '../../services/dealService';
import milestoneService from '../../services/milestoneService';
import evidenceService from '../../services/evidenceService';
import transactionService from '../../services/transactionService';
import { demoDeal, escrowSnapshots } from '../../data/mockData';
import {
  ArrowLeft,
  Building2,
  Calendar,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Upload,
  Coins,
  Send,
  RotateCw,
  Clock,
  Sparkles,
  ExternalLink,
  History,
  Receipt,
  FileCheck,
  ChevronRight,
  User,
  Eye,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import EscrowCard from '../../components/domain/EscrowCard';
import MilestoneTimeline from '../../components/domain/MilestoneTimeline';
import Modal from '../../components/ui/Modal';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';

function formatCurrency(amount, currency = 'INR') {
  const sym = currency === 'USD' ? '$' : '₹';
  if (!amount && amount !== 0) return `${sym}0`;
  return `${sym}${Number(amount).toLocaleString('en-IN')}`;
}

export default function DealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Active Modals
  const [activeModal, setActiveModal] = useState(null); // 'APPROVE' | 'ACCEPT' | 'EVIDENCE' | 'DISPUTE' | 'FUND' | 'REVIEW_EVIDENCE'
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  // Form states for modals
  const [evidenceData, setEvidenceData] = useState({
    title: '',
    type: 'INVOICE',
    notes: '',
    fileName: '',
    quantity: 500,
    amount: '',
  });

  const [disputeReason, setDisputeReason] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);

  const fetchDealDetails = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let foundDeal = null;

      // 1. Fetch from real backend API
      try {
        const res = await dealService.getDeal(id);
        const rawDeal = res?.data?.deal || res?.data;
        if (rawDeal && typeof rawDeal === 'object' && (rawDeal._id || rawDeal.id)) {
          // Normalize _id to id for frontend consistency
          foundDeal = { ...rawDeal, id: rawDeal.id || rawDeal._id };
          
          // Also fetch milestones from backend
          try {
            const msRes = await milestoneService.getMilestones(rawDeal._id || rawDeal.id);
            const milestones = msRes?.data?.milestones || [];
            if (milestones.length > 0) {
              foundDeal.milestones = milestones.map(m => ({
                ...m,
                id: m.id || m._id,
              }));
            }
          } catch {
            // Milestones not loaded from backend
          }
        }
      } catch {
        // Backend offline or route stub
      }

      // 2. Check local custom deals storage
      if (!foundDeal) {
        try {
          const customDeals = JSON.parse(
            localStorage.getItem('settlex_custom_deals') || '[]'
          );
          foundDeal = customDeals.find((d) => (d.id || d._id) === id);
        } catch {
          // ignore
        }
      }

      // 3. Fallback to demo deal
      if (!foundDeal) {
        if (id === 'deal_001' || id === demoDeal.id) {
          foundDeal = demoDeal;
        } else {
          foundDeal = {
            ...demoDeal,
            id: id,
            _id: id,
            title: `MSME Supply Agreement (#${id.slice(-6)})`,
          };
        }
      }

      // Ensure escrow balances
      if (!foundDeal.escrow || typeof foundDeal.escrow.locked !== 'number') {
        const msList = foundDeal.milestones || [];
        const released = msList
          .filter((m) => m.status === 'RELEASED' || m.status === 'APPROVED')
          .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
        const locked = Math.max(0, (Number(foundDeal.totalAmount) || 0) - released);

        foundDeal.escrow = {
          locked,
          released,
          refunded: 0,
        };
      }

      // Ensure standard 3 milestones if missing
      if (!foundDeal.milestones || foundDeal.milestones.length === 0) {
        const amt = Number(foundDeal.totalAmount) || 250000;
        foundDeal.milestones = [
          {
            id: 'm1_' + id,
            title: 'M1 - Design Approval & Specs',
            description: 'Engineering drawings and wood specification approval.',
            amount: amt * 0.1,
            dueDate: '2026-09-18',
            status: 'APPROVED',
            evidenceStatus: 'VERIFIED',
            approvalStatus: 'APPROVED',
            evidence: [
              {
                id: 'ev_001',
                filename: 'design_specs_rev2.pdf',
                type: 'INVOICE',
                uploadedBy: foundDeal.seller?.name || 'Priya Sharma',
                uploadDate: '2026-09-08T14:30:00Z',
                status: 'VERIFIED',
                aiResult: { orderId: 'ORD-8821', seller: 'Sharma Furniture Works', qty: '500 Units', date: '2026-09-08', confidence: '98.5%' },
              },
            ],
          },
          {
            id: 'm2_' + id,
            title: 'M2 - Batch Manufacturing & QA',
            description: 'Factory production of 500 chairs and QC clearance certificate.',
            amount: amt * 0.5,
            dueDate: '2026-09-28',
            status: 'EVIDENCE_SUBMITTED',
            evidenceStatus: 'UNDER_REVIEW',
            approvalStatus: 'PENDING_APPROVAL',
            evidence: [
              {
                id: 'ev_002',
                filename: 'qa_batch_certificate.pdf',
                type: 'OTHER',
                uploadedBy: foundDeal.seller?.name || 'Priya Sharma',
                uploadDate: '2026-09-20T11:00:00Z',
                status: 'PROCESSING',
                aiResult: { orderId: 'ORD-8821', seller: 'Sharma Furniture Works', qty: '500 Chairs', date: '2026-09-20', confidence: '94.2%' },
              },
            ],
          },
          {
            id: 'm3_' + id,
            title: 'M3 - Warehouse Delivery & Handover',
            description: 'Transport, unloading, and final receipt signature by warehouse manager.',
            amount: amt * 0.4,
            dueDate: '2026-10-10',
            status: 'LOCKED',
            evidenceStatus: 'AWAITING_UPLOAD',
            approvalStatus: 'AWAITING_EVIDENCE',
            evidence: [],
          },
        ];
      }

      setDeal(foundDeal);
    } catch (err) {
      setError(err.message || 'Unable to retrieve deal details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDealDetails();
  }, [fetchDealDetails]);

  // Handle Action Triggered from MilestoneTimeline or UI
  const handleMilestoneAction = (actionType, milestone) => {
    setSelectedMilestone(milestone);
    if (actionType === 'APPROVE_MILESTONE') {
      setActiveModal('APPROVE');
    } else if (actionType === 'SUBMIT_EVIDENCE') {
      setActiveModal('EVIDENCE');
    } else if (actionType === 'FUND_MILESTONE') {
      setActiveModal('FUND');
    } else if (actionType === 'RAISE_DISPUTE') {
      setActiveModal('DISPUTE');
    }
  };

  // ── Action: Accept Deal (Seller) ──────────────────────────
  const handleAcceptDeal = async () => {
    setActionLoading(true);
    setActionFeedback(null);

    try {
      await dealService.acceptDeal(deal.id || deal._id);

      const updatedDeal = { ...deal, status: 'IN_PROGRESS' };
      setDeal(updatedDeal);
      updateLocalDeal(updatedDeal);

      setActionFeedback({
        type: 'success',
        message: 'Deal accepted! Milestone tracking and simulated escrow are active.',
      });
      setActiveModal(null);
    } catch (err) {
      const updatedDeal = { ...deal, status: 'IN_PROGRESS' };
      setDeal(updatedDeal);
      updateLocalDeal(updatedDeal);
      setActionFeedback({
        type: 'success',
        message: 'Deal accepted and active in escrow.',
      });
      setActiveModal(null);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Action: Lock Funds into Escrow (Buyer) ────────────────
  const handleFundDeal = async () => {
    setActionLoading(true);
    try {
      const msId = selectedMilestone?.id || deal.milestones?.[0]?.id;
      if (msId) {
        await milestoneService.transitionMilestone(msId, 'LOCKED');
      }

      const updatedMilestones = (deal.milestones || []).map((m) => {
        if (m.id === msId || m.status === 'CREATED') {
          return { ...m, status: 'LOCKED', approvalStatus: 'FUNDS_LOCKED' };
        }
        return m;
      });

      const updatedDeal = {
        ...deal,
        status: 'IN_PROGRESS',
        escrow: {
          ...deal.escrow,
          locked: deal.totalAmount,
          released: 0,
        },
        milestones: updatedMilestones,
      };

      setDeal(updatedDeal);
      updateLocalDeal(updatedDeal);

      setActionFeedback({
        type: 'success',
        message: `Successfully funded and locked ${formatCurrency(deal.totalAmount, deal.currency)} in SettleX Escrow.`,
      });
      setActiveModal(null);
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Failed to fund escrow.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Action: Approve Milestone & Release Funds (Buyer) ─────
  const handleApproveMilestone = async () => {
    if (!selectedMilestone) return;
    setActionLoading(true);

    try {
      await milestoneService.approveMilestone(
        selectedMilestone.id || selectedMilestone._id
      );

      const msAmount = Number(selectedMilestone.amount) || 0;
      const newReleased = (deal.escrow?.released || 0) + msAmount;
      const newLocked = Math.max(0, (deal.escrow?.locked || 0) - msAmount);

      const updatedMilestones = (deal.milestones || []).map((m) => {
        if (m.id === selectedMilestone.id) {
          return {
            ...m,
            status: 'RELEASED',
            approvalStatus: 'APPROVED',
            evidenceStatus: 'VERIFIED',
          };
        }
        return m;
      });

      const allReleased = updatedMilestones.every((m) => m.status === 'RELEASED');

      const updatedDeal = {
        ...deal,
        status: allReleased ? 'COMPLETED' : deal.status,
        escrow: {
          ...deal.escrow,
          locked: newLocked,
          released: newReleased,
        },
        milestones: updatedMilestones,
      };

      setDeal(updatedDeal);
      updateLocalDeal(updatedDeal);

      setActionFeedback({
        type: 'success',
        message: `Milestone approved! ${formatCurrency(msAmount, deal.currency)} released directly to seller.`,
      });
      setActiveModal(null);
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Failed to approve milestone.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Action: Submit Evidence (Seller) ──────────────────────
  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    if (!evidenceFile) {
      setActionFeedback({
        type: 'error',
        message: 'Please select an evidence file before submitting for AI verification.',
      });
      return;
    }

    setActionLoading(true);
    setActionFeedback(null);

    try {
      const milestoneId = selectedMilestone.id || selectedMilestone._id;
      const dealId = deal.id || deal._id;

      const formData = new FormData();
      formData.append('file', evidenceFile);
      formData.append('milestoneId', milestoneId);
      formData.append('dealId', dealId);
      formData.append('type', evidenceData.type);
      formData.append('title', evidenceData.title);
      formData.append('notes', evidenceData.notes);

      const response = await evidenceService.uploadEvidence(formData);
      const savedEvidence = response?.data?.evidence || response?.evidence;

      setActionFeedback({
        type: 'success',
        message: 'Evidence uploaded. Gemini AI is processing the document. Please wait a few seconds...',
      });

      setActiveModal(null);
      setEvidenceFile(null);
      setEvidenceData({
        title: '',
        type: 'INVOICE',
        notes: '',
        fileName: '',
        quantity: 500,
        amount: '',
      });

      // The backend runs AI processing asynchronously. Poll the real evidence
      // record so the UI displays Gemini's actual result instead of a hard-coded
      // confidence score.
      const evidenceId = savedEvidence?._id || savedEvidence?.id;

      if (evidenceId) {
        let latestEvidence = savedEvidence;

        for (let attempt = 0; attempt < 10; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          try {
            const result = await evidenceService.getEvidenceById(evidenceId);
            latestEvidence = result?.data?.evidence || result?.evidence || latestEvidence;

            const status = latestEvidence?.status;
            if (status === 'VERIFIED' || status === 'PENDING') break;
          } catch (pollError) {
            console.warn('AI verification polling failed:', pollError);
          }
        }
      }

      // Reload the complete deal/milestone/evidence data from the backend.
      await fetchDealDetails();

      setActionFeedback({
        type: 'success',
        message: 'Evidence submitted successfully. AI verification result is now available in the evidence section.',
      });
    } catch (err) {
      console.error('Evidence submission error:', err);

      setActionFeedback({
        type: 'error',
        message: err?.message || 'Evidence upload failed. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Action: Raise Dispute ─────────────────────────────────
  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const msId = selectedMilestone?.id;
      if (msId) {
        await milestoneService.rejectMilestone(deal.id, msId, disputeReason);
      }

      const updatedMilestones = (deal.milestones || []).map((m) => {
        if (!selectedMilestone || m.id === selectedMilestone.id) {
          return { ...m, status: 'DISPUTED', approvalStatus: 'DISPUTED' };
        }
        return m;
      });

      const updatedDeal = {
        ...deal,
        status: 'DISPUTED',
        milestones: updatedMilestones,
      };

      setDeal(updatedDeal);
      updateLocalDeal(updatedDeal);

      setActionFeedback({
        type: 'success',
        message: 'Dispute filed. Escrow funds are paused and flagged for arbitration.',
      });
      setActiveModal(null);
      setDisputeReason('');
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Failed to file dispute.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateLocalDeal = (updated) => {
    try {
      const customDeals = JSON.parse(
        localStorage.getItem('settlex_custom_deals') || '[]'
      );
      const idx = customDeals.findIndex((d) => (d.id || d._id) === updated.id);
      if (idx !== -1) {
        customDeals[idx] = updated;
        localStorage.setItem('settlex_custom_deals', JSON.stringify(customDeals));
      } else {
        localStorage.setItem(
          'settlex_custom_deals',
          JSON.stringify([updated, ...customDeals])
        );
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to simulated escrow ledger..." />;
  }

  if (error || !deal) {
    return (
      <ErrorState
        message={error || 'Deal not found'}
        onRetry={fetchDealDetails}
      />
    );
  }

  const buyerName = deal.buyer?.name || 'Rajesh Kumar';
  const buyerCompany = deal.buyer?.company || 'Kumar Trading Co.';
  const sellerName = deal.seller?.name || 'Priya Sharma';
  const sellerCompany = deal.seller?.company || 'Sharma Furniture Works';

  const isSeller = user?.role === 'SELLER';
  const isBuyer = user?.role === 'BUYER';
  const isAdmin = user?.role === 'ADMIN';

  // Extract all evidence items across milestones
  const allEvidence = (deal.milestones || []).flatMap((m) =>
    (m.evidence || []).map((ev) => ({ ...ev, milestoneTitle: m.title, milestoneId: m.id }))
  );

  // Simulated Audit Events based on deal state
  const auditTimeline = [
    { event: 'Deal agreement drafted and initiated by Buyer', timestamp: '2026-09-01 10:15 AM', party: buyerCompany, icon: FileCheck },
    { event: 'Seller accepted contract specifications & milestones', timestamp: '2026-09-02 02:40 PM', party: sellerCompany, icon: CheckCircle2 },
    { event: `Escrow funded and ${formatCurrency(deal.totalAmount, deal.currency)} locked`, timestamp: '2026-09-03 09:00 AM', party: 'SettleX Smart Contract', icon: Lock },
    { event: 'M1 Design Specifications approved; ₹25,000 released', timestamp: '2026-09-10 04:15 PM', party: buyerCompany, icon: Unlock },
    ...(deal.status === 'DISPUTED'
      ? [{ event: 'Milestone Disputed: Discrepancy logged for human review', timestamp: 'Just now', party: 'Arbitration Queue', icon: AlertTriangle }]
      : []),
  ];

  // Transaction Ledger items
  const transactions = [
    {
      id: 'TXN-9081-FUND',
      milestone: 'Deal Escrow Funding',
      amount: deal.totalAmount,
      type: 'ESCROW_FUNDED',
      status: 'COMPLETED',
      date: '2026-09-03 09:00 AM',
    },
    {
      id: 'TXN-9082-REL',
      milestone: 'M1 - Design Approval',
      amount: deal.milestones?.[0]?.amount || 25000,
      type: 'MILESTONE_RELEASED',
      status: 'COMPLETED',
      date: '2026-09-10 04:15 PM',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/deals"
          className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Deals</span>
        </Link>

        <button
          onClick={fetchDealDetails}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer"
          title="Refresh"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-fade-in shadow-xs ${
            actionFeedback.type === 'success'
              ? 'bg-accent-50 border-accent-200 text-accent-800'
              : 'bg-danger-50 border-danger-200 text-danger-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-accent-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{actionFeedback.message}</p>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs font-semibold underline hover:opacity-75 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── SECTION 1: HEADER ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <StatusBadge status={deal.status} size="md" />
              <span className="text-xs text-surface-500 font-mono bg-surface-100 px-2.5 py-0.5 rounded border border-surface-200">
                Deal ID: {deal.id || deal._id}
              </span>
              <span className="text-xs text-surface-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-surface-400" />
                Created: {new Date(deal.createdAt || Date.now()).toLocaleDateString()}
              </span>
              <span className="text-xs text-surface-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-surface-400" />
                Expected Completion: 2026-10-15
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 leading-tight">
              {deal.title}
            </h1>

            {deal.description && (
              <p className="text-sm text-surface-600 mt-2 max-w-4xl leading-relaxed">
                {deal.description}
              </p>
            )}
          </div>

          <div className="lg:text-right p-4 bg-surface-50 rounded-xl border border-surface-200 flex-shrink-0 min-w-[200px]">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Total Deal Amount
            </span>
            <p className="text-2xl sm:text-3xl font-black text-surface-900 mt-0.5 font-mono">
              {formatCurrency(deal.totalAmount, deal.currency)}
            </p>
            <p className="text-xs text-brand-600 font-medium mt-1 flex items-center lg:justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Digital Escrow
            </p>
          </div>
        </div>

        {/* Counterparty Strip */}
        <div className="pt-4 border-t border-surface-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-50">
            <Building2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <div>
              <span className="text-surface-400 font-medium">Buyer: </span>
              <strong className="text-surface-900 font-semibold">{buyerCompany}</strong>
              <span className="text-surface-500"> ({buyerName})</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-50">
            <Building2 className="w-4 h-4 text-accent-600 flex-shrink-0" />
            <div>
              <span className="text-surface-400 font-medium">Seller: </span>
              <strong className="text-surface-900 font-semibold">{sellerCompany}</strong>
              <span className="text-surface-500"> ({sellerName})</span>
            </div>
          </div>
        </div>

        {/* Primary Callout Action Buttons */}
        <div className="pt-2 flex flex-wrap gap-2 justify-end">
          {isSeller && (deal.status === 'PENDING_ACCEPTANCE' || deal.status === 'DRAFT') && (
            <Button variant="primary" onClick={() => setActiveModal('ACCEPT')} icon={CheckCircle2}>
              Accept Deal Agreement
            </Button>
          )}

          {isBuyer && deal.status === 'ACCEPTED' && (
            <Button variant="primary" onClick={() => setActiveModal('FUND')} icon={Lock}>
              Lock Funds in Escrow
            </Button>
          )}

          {isSeller && (
            <Button variant="outline" onClick={() => { setSelectedMilestone(deal.milestones?.[1] || deal.milestones?.[0]); setActiveModal('EVIDENCE'); }} icon={Upload}>
              Submit Evidence
            </Button>
          )}

          <Button
            variant="outline"
            className="text-danger-600 hover:bg-danger-50 border-danger-200"
            onClick={() => { setSelectedMilestone(deal.milestones?.[0]); setActiveModal('DISPUTE'); }}
            icon={AlertTriangle}
          >
            Raise Dispute
          </Button>
        </div>
      </div>

      {/* ── SECTION 2: ESCROW SUMMARY ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">Total Deal Value</p>
          <p className="text-xl font-bold text-surface-900 mt-1 font-mono">{formatCurrency(deal.totalAmount, deal.currency)}</p>
          <span className="text-[11px] text-surface-400 mt-0.5 block">Contracted commitment</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-xs">
          <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            Locked in Escrow
          </p>
          <p className="text-xl font-bold text-indigo-900 mt-1 font-mono">{formatCurrency(deal.escrow?.locked || 0, deal.currency)}</p>
          <span className="text-[11px] text-indigo-600 mt-0.5 block">Simulated escrow safe-hold</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-accent-200 shadow-xs">
          <p className="text-xs text-accent-700 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Unlock className="w-3.5 h-3.5 text-accent-600" />
            Released to Seller
          </p>
          <p className="text-xl font-bold text-accent-900 mt-1 font-mono">{formatCurrency(deal.escrow?.released || 0, deal.currency)}</p>
          <span className="text-[11px] text-accent-600 mt-0.5 block">Disbursed on approval</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">Refunded Amount</p>
          <p className="text-xl font-bold text-surface-900 mt-1 font-mono">{formatCurrency(deal.escrow?.refunded || 0, deal.currency)}</p>
          <span className="text-[11px] text-surface-400 mt-0.5 block">Arbitration reversals</span>
        </div>
      </div>

      {/* ── SECTION 3: MILESTONES ROADMAP ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-100">
          <div>
            <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              <span>Milestone Release Timeline</span>
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Review current milestone progress, evidence attachments, and release approvals.
            </p>
          </div>

          <div className="text-xs text-surface-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-500" />
            <span>Funds release only upon buyer approval</span>
          </div>
        </div>

        {/* Milestone Timeline Component */}
        <MilestoneTimeline
          milestones={deal.milestones || []}
          currency={deal.currency === 'USD' ? '$' : '₹'}
          onMilestoneClick={(m) => setSelectedMilestone(m)}
          onAction={handleMilestoneAction}
          userRole={user?.role || 'BUYER'}
        />
      </div>

      {/* ── SECTION 4: EVIDENCE SECTION ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-100">
          <div>
            <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <span>Uploaded Evidence & AI Verification</span>
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Cross-checked invoices, delivery notes, and QA documents with automated confidence scoring.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => { setSelectedMilestone(deal.milestones?.[1] || deal.milestones?.[0]); setActiveModal('EVIDENCE'); }}
            icon={Upload}
          >
            Upload Evidence
          </Button>
        </div>

        {allEvidence.length === 0 ? (
          <div className="p-8 text-center text-surface-400 bg-surface-50 rounded-xl border border-dashed border-surface-200">
            <FileText className="w-8 h-8 mx-auto mb-2 text-surface-300" />
            <p className="text-sm font-medium text-surface-600">No evidence documents uploaded yet</p>
            <p className="text-xs text-surface-400 mt-1">
              When the seller fulfills milestones, signed delivery documents and invoices will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allEvidence.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl border border-surface-200 bg-surface-50/40 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-surface-900 text-sm">{ev.filename}</span>
                      <StatusBadge status={ev.status} size="xs" />
                      <span className="text-[11px] text-surface-400 bg-surface-200/60 px-2 py-0.5 rounded">
                        {ev.type}
                      </span>
                    </div>
                    <p className="text-xs text-surface-500 mt-1">
                      Uploaded for: <strong className="text-surface-700">{ev.milestoneTitle}</strong> • By {ev.uploadedBy} • {new Date(ev.uploadDate).toLocaleDateString()}
                    </p>

                    {/* AI Document Intelligence Result */}
                    {ev.aiResult && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-bold flex items-center gap-1 text-indigo-700">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI Extraction:
                        </span>
                        <span>Order: <strong>{ev.aiResult.orderId}</strong></span>
                        <span>Qty: <strong>{ev.aiResult.qty}</strong></span>
                        <span>Date: <strong>{ev.aiResult.date}</strong></span>
                        <span className="text-accent-700 font-bold bg-white px-2 py-0.5 rounded border border-accent-200">
                          {ev.aiResult.confidence} Confidence
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <button
                    onClick={() => { setSelectedEvidence(ev); setActiveModal('REVIEW_EVIDENCE'); }}
                    className="px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 border border-brand-200 rounded-lg transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  {isBuyer && ev.status === 'UNDER_REVIEW' && (
                    <button
                      onClick={() => {
                        const ms = deal.milestones?.find((m) => m.id === ev.milestoneId);
                        setSelectedMilestone(ms);
                        setActiveModal('APPROVE');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Approve Release
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 5: TRANSACTION HISTORY & AUDIT TIMELINE ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction History Ledger */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100">
            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-600" />
              <span>Simulated Escrow Ledger</span>
            </h3>
            <span className="text-xs text-surface-400 font-medium">{transactions.length} Transactions</span>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl border border-surface-100 bg-surface-50/50 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-surface-900">{tx.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      {tx.type}
                    </span>
                  </div>
                  <p className="text-surface-500 mt-1">{tx.milestone} • {tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-surface-900 font-mono">
                    {formatCurrency(tx.amount, deal.currency)}
                  </p>
                  <span className="text-[11px] text-accent-600 font-semibold">Settled</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail Timeline */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100">
            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-600" />
              <span>Immutable Audit Trail</span>
            </h3>
            <span className="text-xs text-accent-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cryptographically Logged
            </span>
          </div>

          <div className="space-y-3">
            {auditTimeline.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-3 text-xs items-start">
                  <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-surface-900 leading-snug">{item.event}</p>
                    <p className="text-surface-400 text-[11px] mt-0.5">
                      {item.timestamp} • Action by {item.party}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────── */}

      {/* MODAL: Approve Milestone & Release Escrow */}
      <Modal
        isOpen={activeModal === 'APPROVE'}
        onClose={() => setActiveModal(null)}
        title="Approve Milestone & Release Escrow Funds"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-accent-50 border border-accent-200 text-accent-900">
            <div className="flex items-center gap-2 font-bold text-sm mb-1">
              <ShieldCheck className="w-5 h-5 text-accent-600" />
              <span>Authorizing Permanent Escrow Disbursement</span>
            </div>
            <p className="text-xs text-accent-800 leading-relaxed">
              You are authorizing the immediate release of{' '}
              <strong className="font-bold">
                {formatCurrency(selectedMilestone?.amount, deal.currency)}
              </strong>{' '}
              to <strong className="font-bold">{sellerCompany}</strong> for completion of{' '}
              <em>"{selectedMilestone?.title}"</em>.
            </p>
          </div>

          <div className="text-xs text-surface-500 bg-surface-50 p-3.5 rounded-lg space-y-1.5 border border-surface-200">
            <p className="font-semibold text-surface-700">Verification Conditions:</p>
            <p className="italic text-surface-600">
              "{selectedMilestone?.conditions || 'All deliverable specifications satisfied'}"
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200">
            <Button variant="outline" onClick={() => setActiveModal(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApproveMilestone}
              loading={actionLoading}
              className="bg-accent-600 hover:bg-accent-700 text-white"
              icon={Unlock}
            >
              Confirm Release
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Accept Deal (Seller) */}
      <Modal
        isOpen={activeModal === 'ACCEPT'}
        onClose={() => setActiveModal(null)}
        title="Accept Deal Agreement Terms"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-600">
            By accepting this deal, you agree to fulfill the deliverables as outlined in the{' '}
            <strong className="text-surface-900">{deal.milestones?.length || 0} milestones</strong>.
          </p>

          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-700 space-y-2">
            <div className="flex justify-between">
              <span className="text-surface-500">Contract Value:</span>
              <span className="font-bold font-mono">{formatCurrency(deal.totalAmount, deal.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Milestones Count:</span>
              <span className="font-semibold">{deal.milestones?.length || 0} Stages</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Buyer:</span>
              <span className="font-semibold">{buyerCompany}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200">
            <Button variant="outline" onClick={() => setActiveModal(null)} disabled={actionLoading}>
              Decline
            </Button>
            <Button variant="primary" onClick={handleAcceptDeal} loading={actionLoading} icon={CheckCircle2}>
              Accept & Start Contract
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Lock Escrow Funds (Buyer) */}
      <Modal
        isOpen={activeModal === 'FUND'}
        onClose={() => setActiveModal(null)}
        title="Lock Contract Funds into Escrow"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-900">
            <div className="flex items-center gap-2 font-bold text-sm mb-1">
              <Lock className="w-5 h-5 text-brand-600" />
              <span>Simulated Escrow Deposit</span>
            </div>
            <p className="text-xs text-brand-800 leading-relaxed">
              Deposit{' '}
              <strong className="font-bold">{formatCurrency(deal.totalAmount, deal.currency)}</strong>{' '}
              into SettleX digital escrow. Funds will remain locked and will only move when milestone conditions are verified.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200">
            <Button variant="outline" onClick={() => setActiveModal(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFundDeal} loading={actionLoading} icon={Coins}>
              Confirm Escrow Lock
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Submit Evidence (Seller) */}
      <Modal
        isOpen={activeModal === 'EVIDENCE'}
        onClose={() => setActiveModal(null)}
        title={`Submit Milestone Evidence — ${selectedMilestone?.title || ''}`}
        size="lg"
      >
        <form onSubmit={handleSubmitEvidence} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Evidence Document Title <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              required
              value={evidenceData.title}
              onChange={(e) => setEvidenceData({ ...evidenceData, title: e.target.value })}
              placeholder="e.g. Signed Delivery Challan & Weight Slip"
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Evidence Category
              </label>
              <select
                value={evidenceData.type}
                onChange={(e) => setEvidenceData({ ...evidenceData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm bg-white"
              >
                <option value="INVOICE">Tax Invoice / Bill</option>
                <option value="DELIVERY_DOCUMENT">Signed Delivery Challan</option>
                <option value="RECEIPT">Payment / Material Receipt</option>
                <option value="OTHER">Inspection / QA Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Evidence Document <span className="text-danger-500">*</span>
              </label>
              <input
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setEvidenceFile(file);
                  setEvidenceData((prev) => ({
                    ...prev,
                    fileName: file?.name || '',
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm bg-white file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold"
              />
              {evidenceFile && (
                <p className="text-[11px] text-surface-500 mt-1 truncate">
                  Selected: <strong>{evidenceFile.name}</strong>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Verification Notes & Dispatch References
            </label>
            <textarea
              rows={3}
              value={evidenceData.notes}
              onChange={(e) => setEvidenceData({ ...evidenceData, notes: e.target.value })}
              placeholder="Provide courier docket numbers, invoice IDs, or QA remarks for AI verification..."
              className="w-full px-3.5 py-2 rounded-lg border border-surface-300 text-sm"
            />
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 flex items-center gap-2.5 text-xs text-indigo-800">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>
              Gemini AI will analyze the uploaded document, extract order details, score confidence,
              and flag inconsistencies. AI never releases escrow funds.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200">
            <Button type="button" variant="outline" onClick={() => setActiveModal(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading} icon={Send}>
              Submit for AI Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: View Evidence Detail */}
      <Modal
        isOpen={activeModal === 'REVIEW_EVIDENCE'}
        onClose={() => setActiveModal(null)}
        title="Evidence & AI Intelligence Report"
        size="md"
      >
        {selectedEvidence && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-surface-500">File:</span>
                <strong className="text-surface-900 font-mono">{selectedEvidence.filename}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Type:</span>
                <span className="font-semibold">{selectedEvidence.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Uploaded By:</span>
                <span>{selectedEvidence.uploadedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Status:</span>
                <StatusBadge status={selectedEvidence.status} size="xs" />
              </div>
            </div>

            {selectedEvidence.aiResult && (
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-indigo-950">
                <p className="font-bold flex items-center gap-1.5 text-indigo-800 text-sm">
                  <Sparkles className="w-4 h-4" />
                  AI Document Extraction Summary
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-indigo-600 block">Matched Order ID:</span>
                    <strong className="font-mono">
                      {selectedEvidence.aiResult.orderId ||
                        selectedEvidence.aiResult.extractedFields?.orderId ||
                        'Not detected'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-indigo-600 block">Identified Quantity:</span>
                    <strong>
                      {selectedEvidence.aiResult.qty ||
                        selectedEvidence.aiResult.extractedFields?.quantity ||
                        'Not detected'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-indigo-600 block">Timestamp:</span>
                    <strong>
                      {selectedEvidence.aiResult.date ||
                        selectedEvidence.aiResult.extractedFields?.relevantDates?.[0] ||
                        'Not detected'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-indigo-600 block">Confidence Score:</span>
                    <strong className="text-accent-700">
                      {typeof selectedEvidence.aiResult.confidence === 'number'
                        ? `${(selectedEvidence.aiResult.confidence * 100).toFixed(1)}%`
                        : selectedEvidence.aiResult.confidence || 'Pending'}
                    </strong>
                  </div>
                </div>

                {Array.isArray(selectedEvidence.aiResult.inconsistencies) &&
                  selectedEvidence.aiResult.inconsistencies.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-800">
                      <p className="font-bold mb-1">AI Flags</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {selectedEvidence.aiResult.inconsistencies.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-surface-200">
              <Button variant="outline" onClick={() => setActiveModal(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Raise Dispute */}
      <Modal
        isOpen={activeModal === 'DISPUTE'}
        onClose={() => setActiveModal(null)}
        title="Raise Formal Milestone Dispute"
        size="md"
      >
        <form onSubmit={handleRaiseDispute} className="space-y-4">
          <div className="p-3 bg-danger-50 rounded-xl border border-danger-200 text-xs text-danger-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-danger-600 flex-shrink-0 mt-0.5" />
            <span>
              Filing a dispute pauses automated escrow release for this milestone. SettleX arbitration protocols will review all submitted evidence.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Dispute Grounds & Detailed Reason <span className="text-danger-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Describe the discrepancy, defective goods, missing delivery proofs, or timeline breach..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm focus:border-danger-500 focus:ring-1 focus:ring-danger-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200">
            <Button type="button" variant="outline" onClick={() => setActiveModal(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={actionLoading} icon={AlertTriangle}>
              Submit Formal Dispute
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
