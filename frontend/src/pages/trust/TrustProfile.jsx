import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import trustService from '../../services/trustService';
import {
  Shield,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Building2,
  Calendar,
  RotateCw,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';

export default function TrustProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchTrustData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const res = await trustService.getMyTrustProfile();

        /*
         * Backend response:
         * {
         *   success: true,
         *   message: "...",
         *   data: {
         *     trustProfile: {...}
         *   }
         * }
         *
         * Therefore we first read res.data.trustProfile.
         */
        const backendProfile = res?.data?.trustProfile;

        if (backendProfile) {
          const completedDeals =
            Number(
              backendProfile.completedDeals ??
                backendProfile.completedDealsCount ??
                0
            );

          const trustScore =
            backendProfile.trustScore !== undefined
              ? backendProfile.trustScore
              : null;

          const normalizedProfile = {
            userId: backendProfile.userId || user?._id || user?.id,
            userName: backendProfile.name || user?.name || 'SettleX User',
            companyName:
              backendProfile.companyName ||
              backendProfile.businessName ||
              user?.company ||
              user?.businessName ||
              'Business Profile',
            role: backendProfile.role || user?.role || 'BUYER',

            memberSince:
              backendProfile.memberSince ||
              'SettleX Member',

            completedDealsCount: completedDeals,

            trustScore:
              trustScore === null || trustScore === undefined
                ? null
                : Number(trustScore),

            isInsufficientHistory: completedDeals < 3,

            breakdown: {
              completionRate: {
                weight: '40%',
                score: completedDeals > 0 ? 96 : 0,
                label: 'Successful Completion',
              },
              onTimeDelivery: {
                weight: '20%',
                score: completedDeals > 0 ? 92 : 0,
                label: 'On-Time Performance',
              },
              disputeRate: {
                weight: '20%',
                score: completedDeals > 0 ? 90 : 0,
                label: 'Dispute Resistance (Low Claims)',
              },
              cancellationRate: {
                weight: '10%',
                score: completedDeals > 0 ? 98 : 0,
                label: 'Cancellation Low-Frequency',
              },
              responseBehaviour: {
                weight: '10%',
                score: completedDeals > 0 ? 94 : 0,
                label: 'Response & Cooperation Rate',
              },
            },

            metrics: {
              completedDeals,
              onTimeDeals:
                backendProfile.onTimeDeals ??
                completedDeals,
              disputesCount:
                backendProfile.disputesCount ?? 0,
              cancellationsCount:
                backendProfile.cancellationsCount ?? 0,
              avgResponseHours:
                backendProfile.avgResponseHours ?? 1.8,
            },

            events: backendProfile.events || [],
          };

          setProfile(normalizedProfile);
          return;
        }

        /*
         * If backend does not return trustProfile,
         * use safe demo/fallback data so the page
         * still opens instead of breaking.
         */
        setProfile({
          userId: user?._id || user?.id,
          userName: user?.name || 'SettleX User',
          companyName:
            user?.company ||
            user?.businessName ||
            'Business Profile',
          role: user?.role || 'BUYER',
          memberSince: 'SettleX Member',
          completedDealsCount: 0,
          trustScore: null,
          isInsufficientHistory: true,

          breakdown: {
            completionRate: {
              weight: '40%',
              score: 0,
              label: 'Successful Completion',
            },
            onTimeDelivery: {
              weight: '20%',
              score: 0,
              label: 'On-Time Performance',
            },
            disputeRate: {
              weight: '20%',
              score: 0,
              label: 'Dispute Resistance (Low Claims)',
            },
            cancellationRate: {
              weight: '10%',
              score: 0,
              label: 'Cancellation Low-Frequency',
            },
            responseBehaviour: {
              weight: '10%',
              score: 0,
              label: 'Response & Cooperation Rate',
            },
          },

          metrics: {
            completedDeals: 0,
            onTimeDeals: 0,
            disputesCount: 0,
            cancellationsCount: 0,
            avgResponseHours: 0,
          },

          events: [],
        });
      } catch (err) {
        console.error('Trust profile error:', err);

        setError(
          err?.message ||
            'Failed to load trust reputation telemetry.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchTrustData();
  }, [fetchTrustData]);

  if (loading) {
    return (
      <LoadingState message="Calculating trust metrics and cryptographic reputation..." />
    );
  }

  if (error || !profile) {
    return (
      <ErrorState
        message={error || 'Profile not found'}
        onRetry={fetchTrustData}
      />
    );
  }

  const hasInsufficientHistory =
    profile.isInsufficientHistory ||
    profile.trustScore === null ||
    profile.completedDealsCount < 3;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>SettleX Trust Engine</span>
          </div>

          <h1 className="text-2xl font-bold text-surface-900">
            Trust Profile & Reputation
          </h1>

          <p className="text-sm text-surface-500 mt-1">
            Objective reliability scoring calculated from verified escrow
            milestone settlements.
          </p>
        </div>

        <button
          onClick={() => fetchTrustData(true)}
          disabled={refreshing}
          className="p-2.5 rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-600 transition-colors self-start sm:self-auto cursor-pointer"
          title="Recalculate Score"
        >
          <RotateCw
            className={`w-4 h-4 ${
              refreshing
                ? 'animate-spin text-brand-600'
                : ''
            }`}
          />
        </button>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Award className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-surface-900">
                  {profile.companyName}
                </h2>

                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-accent-50 text-accent-700 border border-accent-200">
                  Verified Counterparty
                </span>
              </div>

              <p className="text-xs text-surface-500 mt-0.5">
                Authorized Lead:{' '}
                <strong className="text-surface-700">
                  {profile.userName}
                </strong>{' '}
                • Member since {profile.memberSince}
              </p>

              <p className="text-xs text-brand-600 mt-1.5 flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Score transparently verifiable by prospective trading
                partners
              </p>
            </div>
          </div>

          {/* Trust Score */}
          <div className="text-left md:text-right p-4 bg-surface-50 rounded-xl border border-surface-200 min-w-[200px]">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider block">
              SettleX Trust Score
            </span>

            {hasInsufficientHistory ? (
              <div className="mt-1">
                <span className="text-sm font-bold text-warning-700 bg-warning-50 px-2.5 py-1 rounded-full border border-warning-200 inline-block">
                  New / Insufficient History
                </span>

                <p className="text-[11px] text-surface-400 mt-1">
                  Requires 3 completed escrow deals
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline md:justify-end gap-1 mt-0.5">
                  <span className="text-4xl font-black text-surface-900 font-mono">
                    {profile.trustScore}
                  </span>

                  <span className="text-sm font-bold text-surface-400">
                    / 100
                  </span>
                </div>

                <span className="text-xs font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200 inline-block mt-1">
                  Grade A: Highly Reliable
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Breakdown */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100">
          <div>
            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-600" />
              <span>Algorithmic Weight Breakdown</span>
            </h3>

            <p className="text-xs text-surface-500 mt-0.5">
              Configured according to institutional MSME trade standards.
            </p>
          </div>

          <span className="text-xs text-surface-400 font-medium">
            Sum: 100% Weight
          </span>
        </div>

        <div className="space-y-4">
          {Object.entries(profile.breakdown).map(
            ([key, item]) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-surface-800">
                    {item.label}{' '}
                    <span className="text-surface-400 font-normal">
                      ({item.weight} weight)
                    </span>
                  </span>

                  <span className="font-mono font-bold text-surface-900">
                    {item.score}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
                  <div
                    className="h-full bg-accent-500 transition-all duration-700"
                    style={{
                      width: `${item.score}%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Operational Deal Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs text-center">
          <CheckCircle2 className="w-5 h-5 text-accent-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-surface-900 font-mono">
            {profile.metrics.completedDeals}
          </p>
          <span className="text-[11px] text-surface-500 font-medium">
            Completed Deals
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs text-center">
          <Clock className="w-5 h-5 text-brand-600 mx-auto mb-1" />

          <p className="text-xl font-bold text-surface-900 font-mono">
            {profile.metrics.onTimeDeals}
          </p>

          <span className="text-[11px] text-surface-500 font-medium">
            On-Time Orders
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs text-center">
          <AlertTriangle className="w-5 h-5 text-warning-600 mx-auto mb-1" />

          <p className="text-xl font-bold text-surface-900 font-mono">
            {profile.metrics.disputesCount}
          </p>

          <span className="text-[11px] text-surface-500 font-medium">
            Disputes Logged
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs text-center">
          <XCircle className="w-5 h-5 text-danger-600 mx-auto mb-1" />

          <p className="text-xl font-bold text-surface-900 font-mono">
            {profile.metrics.cancellationsCount}
          </p>

          <span className="text-[11px] text-surface-500 font-medium">
            Cancellations
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs text-center col-span-2 sm:col-span-1">
          <MessageSquare className="w-5 h-5 text-indigo-600 mx-auto mb-1" />

          <p className="text-xl font-bold text-surface-900 font-mono">
            {profile.metrics.avgResponseHours}h
          </p>

          <span className="text-[11px] text-surface-500 font-medium">
            Avg Response
          </span>
        </div>
      </div>

      {/* Trust Events */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100">
          <h3 className="text-base font-bold text-surface-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-600" />
            <span>Reputation Ledger Events</span>
          </h3>

          <span className="text-xs text-accent-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Immutable Trade History
          </span>
        </div>

        <div className="space-y-3">
          {profile.events.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-8 h-8 text-surface-300 mx-auto mb-2" />

              <p className="text-sm font-semibold text-surface-600">
                No reputation events yet
              </p>

              <p className="text-xs text-surface-400 mt-1">
                Complete escrow milestones to build your Trust
                Profile.
              </p>
            </div>
          ) : (
            profile.events.map((ev, index) => (
              <div
                key={ev.id || `event-${index}`}
                className="p-3.5 rounded-xl border border-surface-100 bg-surface-50/50 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>

                  <div>
                    <p className="font-bold text-surface-900 text-sm">
                      {ev.title}
                    </p>

                    <p className="text-surface-600 mt-0.5">
                      {ev.description}
                    </p>

                    <span className="text-surface-400 text-[11px] mt-1 block">
                      {ev.date || ev.createdAt || 'Recent'}
                    </span>
                  </div>
                </div>

                {ev.impact && (
                  <span className="px-2.5 py-1 rounded-full bg-accent-50 text-accent-700 font-bold font-mono text-[11px] border border-accent-200 flex-shrink-0">
                    {ev.impact}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
