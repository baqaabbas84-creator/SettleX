import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Eye,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Lock,
  Coins,
  Send,
  UserCheck
} from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

// Canonical Happy-Path Lifecycle Order
const LIFECYCLE_STAGES = [
  { key: 'CREATED', label: 'Created', icon: Circle },
  { key: 'FUNDED', label: 'Funded', icon: Coins },
  { key: 'LOCKED', label: 'Locked in Escrow', icon: Lock },
  { key: 'MILESTONE_IN_PROGRESS', label: 'In Progress', icon: Clock },
  { key: 'EVIDENCE_SUBMITTED', label: 'Evidence Submitted', icon: Send },
  { key: 'UNDER_REVIEW', label: 'Under Review', icon: Eye },
  { key: 'APPROVED', label: 'Approved', icon: UserCheck },
  { key: 'RELEASED', label: 'Escrow Released', icon: ShieldCheck },
];

const DISPUTE_STAGES = [
  { key: 'DISPUTED', label: 'Disputed', icon: AlertTriangle },
  { key: 'HUMAN_REVIEW', label: 'Human Review', icon: Eye },
  { key: 'REFUNDED', label: 'Refunded', icon: RotateCcw },
];

function getStageIndex(status) {
  const normalized = status ? String(status).toUpperCase() : 'CREATED';
  const idx = LIFECYCLE_STAGES.findIndex(s => s.key === normalized);
  if (idx !== -1) return { stageIndex: idx, isDispute: false };

  const disputeIdx = DISPUTE_STAGES.findIndex(s => s.key === normalized);
  if (disputeIdx !== -1) return { stageIndex: disputeIdx, isDispute: true };

  return { stageIndex: 0, isDispute: false };
}

function formatCurrency(amount, currency = '₹') {
  if (!amount && amount !== 0) return `${currency}0`;
  if (amount >= 100000 && currency === '₹') {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `${currency}${Number(amount).toLocaleString('en-IN')}`;
}

export default function MilestoneTimeline({
  milestones = [],
  currency = '₹',
  onMilestoneClick,
  onAction,
  userRole = 'BUYER',
  className = '',
}) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-8 text-surface-400 bg-surface-50 rounded-xl border border-dashed border-surface-200">
        <p className="text-sm">No milestones recorded for this deal.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {milestones.map((milestone, index) => {
        const id = milestone.id || milestone._id || `ms_${index}`;
        const isExpanded = expandedId === id;
        const { stageIndex, isDispute } = getStageIndex(milestone.status);
        const isCompleted = milestone.status === 'RELEASED' || milestone.status === 'APPROVED';
        const isDisputed = milestone.status === 'DISPUTED' || milestone.status === 'HUMAN_REVIEW';
        const isLast = index === milestones.length - 1;

        return (
          <div key={id} className="relative flex gap-4">
            {/* Timeline track + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-accent-50 border-accent-500 text-accent-600 shadow-sm'
                    : isDisputed
                    ? 'bg-danger-50 border-danger-500 text-danger-600 ring-4 ring-danger-100'
                    : milestone.status === 'LOCKED'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600 ring-4 ring-indigo-100'
                    : milestone.status === 'MILESTONE_IN_PROGRESS' || milestone.status === 'UNDER_REVIEW'
                    ? 'bg-brand-50 border-brand-500 text-brand-600 ring-4 ring-brand-100 animate-pulse'
                    : 'bg-white border-surface-300 text-surface-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isDisputed ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-12 transition-colors ${
                    isCompleted ? 'bg-accent-400' : 'bg-surface-200'
                  }`}
                />
              )}
            </div>

            {/* Milestone Card */}
            <div className="flex-1 pb-6">
              <div
                className={`rounded-xl border transition-all ${
                  isCompleted
                    ? 'border-accent-200 bg-accent-50/15'
                    : isDisputed
                    ? 'border-danger-200 bg-danger-50/15'
                    : 'border-surface-200 bg-white hover:border-brand-200 shadow-xs'
                }`}
              >
                {/* Header row */}
                <div
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => {
                    toggleExpand(id);
                    onMilestoneClick?.(milestone);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                        Milestone {index + 1}
                      </span>
                      <StatusBadge status={milestone.status} size="xs" />
                    </div>
                    <h4 className="text-base font-semibold text-surface-900 leading-snug">
                      {milestone.title}
                    </h4>
                    {milestone.description && (
                      <p className="text-sm text-surface-500 mt-1 line-clamp-2">
                        {milestone.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-100">
                    <div className="text-right">
                      <span className="text-lg font-bold text-surface-900">
                        {formatCurrency(milestone.amount, currency)}
                      </span>
                      <p className="text-[11px] text-surface-400 font-medium">Escrow Allocation</p>
                    </div>
                    <button
                      type="button"
                      className="p-1 rounded-md text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Sub-meta chips */}
                <div className="px-4 sm:px-5 pb-4 flex flex-wrap items-center gap-4 text-xs text-surface-500 border-t border-surface-100 pt-3 bg-surface-50/40 rounded-b-xl">
                  {milestone.dueDate && (
                    <span className="flex items-center gap-1.5 font-medium text-surface-600">
                      <Clock className="w-3.5 h-3.5 text-surface-400" />
                      Due: {new Date(milestone.dueDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  )}

                  {milestone.conditions && (
                    <span className="flex items-center gap-1.5 text-surface-600 truncate max-w-md">
                      <span className="font-semibold text-surface-700">Condition:</span>
                      <span className="truncate">{milestone.conditions}</span>
                    </span>
                  )}

                  {milestone.evidence && milestone.evidence.length > 0 && (
                    <span className="flex items-center gap-1.5 font-medium text-brand-600">
                      <FileText className="w-3.5 h-3.5" />
                      {milestone.evidence.length} evidence attachment(s)
                    </span>
                  )}
                </div>

                {/* Expanded Detailed Lifecycle Stepper */}
                {isExpanded && (
                  <div className="p-5 border-t border-surface-200 bg-surface-50/60 rounded-b-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-surface-600">
                        Escrow State Machine Journey
                      </h5>
                      <span className="text-xs text-surface-400">
                        {isDispute ? 'Dispute Resolution Track' : `Stage ${stageIndex + 1} of ${LIFECYCLE_STAGES.length}`}
                      </span>
                    </div>

                    {/* Stepper track */}
                    {!isDispute ? (
                      <div className="overflow-x-auto pb-2">
                        <div className="flex items-center min-w-[620px] justify-between relative">
                          {/* Background connecting bar */}
                          <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-surface-200 -z-0" />
                          <div
                            className="absolute top-3.5 left-4 h-0.5 bg-accent-500 transition-all duration-500 -z-0"
                            style={{
                              width: `${(Math.min(stageIndex, LIFECYCLE_STAGES.length - 1) / (LIFECYCLE_STAGES.length - 1)) * 100}%`
                            }}
                          />

                          {LIFECYCLE_STAGES.map((stage, sIdx) => {
                            const Icon = stage.icon;
                            const isPast = sIdx < stageIndex;
                            const isCurrent = sIdx === stageIndex;

                            return (
                              <div key={stage.key} className="flex flex-col items-center text-center z-10 w-20">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                                    isPast
                                      ? 'bg-accent-500 text-white shadow-xs'
                                      : isCurrent
                                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-md animate-pulse'
                                      : 'bg-white border-2 border-surface-300 text-surface-400'
                                  }`}
                                >
                                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                                </div>
                                <span
                                  className={`text-[10px] mt-1.5 font-medium leading-tight ${
                                    isCurrent
                                      ? 'text-brand-700 font-bold'
                                      : isPast
                                      ? 'text-surface-700'
                                      : 'text-surface-400'
                                  }`}
                                >
                                  {stage.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Dispute Stepper */
                      <div className="p-3 bg-danger-50/60 rounded-lg border border-danger-200">
                        <div className="flex items-center gap-2 text-danger-700 text-sm font-semibold mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          Active Dispute Under Review
                        </div>
                        <p className="text-xs text-danger-600">
                          Funds are locked safely in escrow. SettleX arbitration is evaluating submitted logs and evidence.
                        </p>
                      </div>
                    )}

                    {/* Contextual Actions inside Milestone */}
                    {onAction && (
                      <div className="pt-3 border-t border-surface-200 flex flex-wrap gap-2 justify-end">
                        {userRole === 'BUYER' && (milestone.status === 'EVIDENCE_SUBMITTED' || milestone.status === 'UNDER_REVIEW') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction('APPROVE_MILESTONE', milestone);
                            }}
                            className="px-3.5 py-1.5 bg-accent-600 hover:bg-accent-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            Approve & Release Funds
                          </button>
                        )}

                        {userRole === 'BUYER' && milestone.status === 'CREATED' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction('FUND_MILESTONE', milestone);
                            }}
                            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            Lock Funds in Escrow
                          </button>
                        )}

                        {userRole === 'SELLER' && (milestone.status === 'LOCKED' || milestone.status === 'MILESTONE_IN_PROGRESS') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction('SUBMIT_EVIDENCE', milestone);
                            }}
                            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            Submit Milestone Evidence
                          </button>
                        )}

                        {milestone.status !== 'RELEASED' && milestone.status !== 'REFUNDED' && milestone.status !== 'DISPUTED' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction('RAISE_DISPUTE', milestone);
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-danger-50 text-danger-600 border border-danger-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                          >
                            Dispute Milestone
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
