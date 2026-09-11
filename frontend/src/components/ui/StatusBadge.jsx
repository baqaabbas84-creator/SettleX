const STATUS_CONFIG = {
  // Deal statuses
  DRAFT: { label: 'Draft', bg: 'bg-surface-100', text: 'text-surface-600', dot: 'bg-surface-400' },
  PENDING: { label: 'Pending', bg: 'bg-warning-50', text: 'text-warning-700', dot: 'bg-warning-500' },
  FUNDED: { label: 'Funded', bg: 'bg-brand-50', text: 'text-brand-700', dot: 'bg-brand-500' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-brand-50', text: 'text-brand-700', dot: 'bg-brand-500' },
  COMPLETED: { label: 'Completed', bg: 'bg-accent-50', text: 'text-accent-700', dot: 'bg-accent-500' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-surface-100', text: 'text-surface-600', dot: 'bg-surface-400' },

  // Milestone statuses
  CREATED: { label: 'Created', bg: 'bg-surface-100', text: 'text-surface-600', dot: 'bg-surface-400' },
  LOCKED: { label: 'Locked', bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' },
  MILESTONE_IN_PROGRESS: { label: 'In Progress', bg: 'bg-brand-50', text: 'text-brand-700', dot: 'bg-brand-500' },
  EVIDENCE_SUBMITTED: { label: 'Evidence Submitted', bg: 'bg-warning-50', text: 'text-warning-700', dot: 'bg-warning-500' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-warning-50', text: 'text-warning-700', dot: 'bg-warning-500' },
  APPROVED: { label: 'Approved', bg: 'bg-accent-50', text: 'text-accent-700', dot: 'bg-accent-500' },
  RELEASED: { label: 'Released', bg: 'bg-accent-50', text: 'text-accent-700', dot: 'bg-accent-500' },
  REJECTED: { label: 'Rejected', bg: 'bg-danger-50', text: 'text-danger-700', dot: 'bg-danger-500' },

  // Evidence statuses
  VERIFIED: { label: 'Verified', bg: 'bg-accent-50', text: 'text-accent-700', dot: 'bg-accent-500' },
  UNVERIFIED: { label: 'Unverified', bg: 'bg-surface-100', text: 'text-surface-600', dot: 'bg-surface-400' },

  // Transaction statuses
  FUND: { label: 'Fund', bg: 'bg-brand-50', text: 'text-brand-700', dot: 'bg-brand-500' },
  RELEASE: { label: 'Release', bg: 'bg-accent-50', text: 'text-accent-700', dot: 'bg-accent-500' },
  REFUND: { label: 'Refund', bg: 'bg-warning-50', text: 'text-warning-700', dot: 'bg-warning-500' },
  HOLD: { label: 'Hold', bg: 'bg-danger-50', text: 'text-danger-700', dot: 'bg-danger-500' },

  // Dispute statuses
  OPEN: { label: 'Open', bg: 'bg-danger-50', text: 'text-danger-700', dot: 'bg-danger-500' },
  RESOLVED: { label: 'Resolved', bg: 'bg-accent-50', text: 'text-accent-700', dot: 'bg-accent-500' },
  ESCALATED: { label: 'Escalated', bg: 'bg-warning-50', text: 'text-warning-700', dot: 'bg-warning-500' },
};

export default function StatusBadge({ status, size = 'sm', showDot = true, className = '' }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-surface-100',
    text: 'text-surface-600',
    dot: 'bg-surface-400',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${config.bg} ${config.text} ${sizes[size]} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  );
}
