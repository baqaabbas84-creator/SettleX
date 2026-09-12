import { Shield, CheckCircle2, Clock, AlertTriangle, XCircle, Star } from 'lucide-react';

export default function TrustScoreCard({ profile, className = '' }) {
  if (!profile) return null;

  const { trustScore, isNewBusiness, metrics, scoreExplanation, name, company } = profile;

  // Trust score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-accent-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const getScoreRingColor = (score) => {
    if (score >= 80) return 'stroke-accent-500';
    if (score >= 60) return 'stroke-warning-500';
    return 'stroke-danger-500';
  };

  const metricsList = metrics
    ? [
        { label: 'Successful Completion', value: metrics.successfulCompletion, icon: CheckCircle2, suffix: '%' },
        { label: 'On-time Delivery', value: metrics.onTimeDelivery, icon: Clock, suffix: '%' },
        { label: 'Dispute Rate', value: metrics.disputeRate, icon: AlertTriangle, suffix: '%', inverse: true },
        { label: 'Cancellation Rate', value: metrics.cancellationRate, icon: XCircle, suffix: '%', inverse: true },
        { label: 'Response Behaviour', value: metrics.responseBehaviour, icon: Star, suffix: '%' },
      ]
    : [];

  // SVG ring progress
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = trustScore != null
    ? circumference - (trustScore / 100) * circumference
    : circumference;

  return (
    <div className={`bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Trust Profile</h3>
            <p className="text-xs text-surface-500">{name} · {company}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isNewBusiness ? (
          /* New Business State */
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-surface-400" />
            </div>
            <h4 className="text-lg font-semibold text-surface-700">New / Insufficient History</h4>
            <p className="text-sm text-surface-500 mt-2 max-w-xs mx-auto">
              {scoreExplanation}
            </p>
          </div>
        ) : (
          <>
            {/* Score Ring */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60" cy="60" r={radius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60" cy="60" r={radius}
                    fill="none"
                    className={getScoreRingColor(trustScore)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(trustScore)}`}>{trustScore}</span>
                  <span className="text-xs text-surface-500">{getScoreLabel(trustScore)}</span>
                </div>
              </div>
            </div>

            {/* Score Explanation */}
            {scoreExplanation && (
              <p className="text-sm text-surface-600 text-center mb-6 px-4">{scoreExplanation}</p>
            )}

            {/* Metrics */}
            <div className="space-y-3">
              {metricsList.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-surface-600">
                    <metric.icon className="w-4 h-4 text-surface-400" />
                    <span>{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-surface-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          metric.inverse
                            ? metric.value > 10
                              ? 'bg-danger-400'
                              : 'bg-accent-400'
                            : metric.value >= 80
                            ? 'bg-accent-400'
                            : metric.value >= 60
                            ? 'bg-warning-400'
                            : 'bg-danger-400'
                        }`}
                        style={{ width: `${Math.min(metric.value, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-surface-900 w-10 text-right">
                      {metric.value}{metric.suffix}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
