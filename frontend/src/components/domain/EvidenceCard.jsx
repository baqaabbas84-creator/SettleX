import { FileText, Calendar, User, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export default function EvidenceCard({ evidence, aiResult, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden ${className}`}>
      <div className="p-5">
        {/* File info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-brand-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-surface-900 text-sm truncate">{evidence.filename}</h4>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-surface-500">
              <span className="capitalize">{evidence.type}</span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {evidence.uploadedBy}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(evidence.uploadDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <StatusBadge status={evidence.status} size="xs" />
        </div>

        {/* AI Verification Result */}
        {aiResult && (
          <div className="mt-4 p-4 rounded-lg bg-surface-50 border border-surface-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600">AI</span>
              </div>
              <span className="text-xs font-semibold text-surface-700">AI Verification Assistant</span>
              <span className="text-xs text-surface-400">•</span>
              <span className="text-xs text-surface-500">
                Confidence: {Math.round(aiResult.confidence * 100)}%
              </span>
            </div>

            {/* Extracted data */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {aiResult.extractedData && Object.entries(aiResult.extractedData).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-surface-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                  <span className="font-medium text-surface-900">{value}</span>
                </div>
              ))}
            </div>

            {/* Inconsistencies */}
            {aiResult.inconsistencies?.length > 0 && (
              <div className="space-y-2">
                {aiResult.inconsistencies.map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 rounded-md bg-warning-50 border border-warning-200"
                  >
                    <AlertTriangle className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-warning-800">{issue.message}</p>
                      <p className="text-warning-600 mt-0.5">
                        Expected: {issue.expected} → Found: {issue.found}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[10px] text-surface-400 mt-3 italic">
              AI analysis is provided as an assistant — not a financial authority. Human review is required.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
