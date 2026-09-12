import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-surface-200 shadow-sm p-5 card-hover ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-surface-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 ml-3">
            <Icon className="w-5 h-5 text-brand-600" />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3">
          {trend === 'up' ? (
            <TrendingUp className="w-3.5 h-3.5 text-accent-600" />
          ) : trend === 'down' ? (
            <TrendingDown className="w-3.5 h-3.5 text-danger-500" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-surface-400" />
          )}
          <span
            className={`text-xs font-medium ${
              trend === 'up' ? 'text-accent-600' : trend === 'down' ? 'text-danger-500' : 'text-surface-400'
            }`}
          >
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}
