import { CheckCircle2, Circle, Clock, FileText, Eye, ThumbsUp, ArrowRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const STEP_ICONS = {
  CREATED: Circle,
  FUNDED: Circle,
  LOCKED: Clock,
  MILESTONE_IN_PROGRESS: Clock,
  EVIDENCE_SUBMITTED: FileText,
  UNDER_REVIEW: Eye,
  APPROVED: ThumbsUp,
  RELEASED: CheckCircle2,
  PENDING: Circle,
  REJECTED: Circle,
};

const STEP_COLORS = {
  CREATED: 'text-surface-400 border-surface-300',
  FUNDED: 'text-brand-500 border-brand-300',
  LOCKED: 'text-indigo-500 border-indigo-300',
  MILESTONE_IN_PROGRESS: 'text-brand-500 border-brand-300',
  EVIDENCE_SUBMITTED: 'text-warning-500 border-warning-300',
  UNDER_REVIEW: 'text-warning-500 border-warning-300',
  APPROVED: 'text-accent-500 border-accent-300',
  RELEASED: 'text-accent-500 border-accent-300',
  PENDING: 'text-surface-400 border-surface-300',
  REJECTED: 'text-danger-500 border-danger-300',
};

const COMPLETED_STATUSES = ['APPROVED', 'RELEASED'];
const ACTIVE_STATUSES = ['MILESTONE_IN_PROGRESS', 'EVIDENCE_SUBMITTED', 'UNDER_REVIEW'];

function formatCurrency(amount) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function MilestoneTimeline({ milestones = [], onMilestoneClick, className = '' }) {
  return (
    <div className={`space-y-0 ${className}`}>
      {milestones.map((milestone, index) => {
        const StepIcon = STEP_ICONS[milestone.status] || Circle;
        const isCompleted = COMPLETED_STATUSES.includes(milestone.status);
        const isActive = ACTIVE_STATUSES.includes(milestone.status);
        const isLast = index === milestones.length - 1;

        return (
          <div key={milestone.id} className="relative flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? 'bg-accent-50 border-accent-400 text-accent-600'
                    : isActive
                    ? 'bg-brand-50 border-brand-400 text-brand-600'
                    : STEP_COLORS[milestone.status] || 'text-surface-400 border-surface-300'
                } ${isActive ? 'ring-4 ring-brand-100' : ''}`}
              >
                <StepIcon className="w-4 h-4" />
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-8 ${
                    isCompleted ? 'bg-accent-300' : 'bg-surface-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div
              className={`flex-1 pb-6 ${onMilestoneClick ? 'cursor-pointer' : ''}`}
              onClick={() => onMilestoneClick?.(milestone)}
            >
              <div className={`rounded-lg border p-4 ${
                isActive
                  ? 'border-brand-200 bg-brand-50/30'
                  : isCompleted
                  ? 'border-accent-200 bg-accent-50/20'
                  : 'border-surface-200 bg-white'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-surface-900 text-sm">{milestone.title}</h4>
                    {milestone.description && (
                      <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{milestone.description}</p>
                    )}
                  </div>
                  <StatusBadge status={milestone.status} size="xs" />
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-surface-500">
                  <span className="font-semibold text-surface-900">
                    {formatCurrency(milestone.amount)}
                  </span>
                  {milestone.dueDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due: {milestone.dueDate}
                    </span>
                  )}
                  {milestone.evidence?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {milestone.evidence.length} evidence
                    </span>
                  )}
                </div>

                {milestone.conditions && (
                  <p className="text-xs text-surface-400 mt-2 italic">
                    Condition: {milestone.conditions}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
