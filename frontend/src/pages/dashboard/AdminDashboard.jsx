import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  Lock,
  AlertTriangle,
  ShieldCheck,
  Receipt,
  Scale,
  DollarSign,
  TrendingUp,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { adminAnalytics, adminUsers } from '../../data/mockData';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData(adminAnalytics);
    setUsers(adminUsers);
    setLoading(false);
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-surface-500">Loading dashboard...</div>;
  }

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Platform Command Center</h1>
          <p className="text-sm text-surface-500 mt-1">
            System-wide escrow liquidity, user compliance, dispute arbitration, and audit telemetry.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/audit')}>
            Audit Logs
          </Button>
          <Button onClick={() => navigate('/escrow')} icon={Lock}>
            Master Escrow
          </Button>
        </div>
      </div>

      {/* KPI Cards: Platform Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Escrow Flow"
          value={formatCurrency(data.totalTransactionValue || 34200000)}
          icon={Activity}
          trend="up"
          trendValue="+18.4% volume this month"
        />
        <StatCard
          title="System Locked Escrow"
          value={formatCurrency(data.lockedAmount || 14800000)}
          icon={Lock}
          className="border-indigo-100"
          trend="up"
          trendValue="Across 142 contracts"
        />
        <StatCard
          title="Active Disputes"
          value="2 Cases"
          icon={AlertTriangle}
          className="border-danger-100"
          trend="down"
          trendValue="Requires arbitration"
        />
        <StatCard
          title="Network Trust Health"
          value={`${data.avgTrustScore || 88.4} / 100`}
          icon={ShieldCheck}
          className="border-accent-100"
          trend="up"
          trendValue="94.1% on-time delivery"
        />
      </div>

      {/* Admin Quick Action Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/admin/users')}
          className="p-4 bg-white rounded-xl border border-surface-200 hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">User Directory</p>
              <p className="text-base font-bold text-surface-900">Manage KYC Accounts</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-surface-400" />
        </div>

        <div
          onClick={() => navigate('/disputes')}
          className="p-4 bg-white rounded-xl border border-surface-200 hover:border-danger-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger-50 text-danger-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Arbitration</p>
              <p className="text-base font-bold text-surface-900">Review Open Claims</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-surface-400" />
        </div>

        <div
          onClick={() => navigate('/analytics')}
          className="p-4 bg-white rounded-xl border border-surface-200 hover:border-accent-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Trust Engine</p>
              <p className="text-base font-bold text-surface-900">Ecosystem Analytics</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-surface-400" />
        </div>
      </div>

      {/* Users & Onboarding Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Enterprise Onboarding & Verifications</CardTitle>
            <p className="text-xs text-surface-400 mt-0.5">Audit compliance and verify trade partner identities.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
            View All Users
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface-200 text-surface-500 text-left uppercase">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Company</th>
                <th className="py-3 px-4 text-center font-semibold">Trust Score</th>
                <th className="py-3 px-4 font-semibold">KYC Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-50">
                  <td className="py-3.5 px-4 font-bold text-surface-900">{user.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-semibold bg-surface-100 px-2 py-0.5 rounded">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-surface-600">{user.company}</td>
                  <td className="py-3.5 px-4 text-center font-bold font-mono text-surface-900">
                    {user.trustScore ? `${user.trustScore} / 100` : 'New'}
                  </td>
                  <td className="py-3.5 px-4">
                    {user.verified ? (
                      <StatusBadge status="VERIFIED" size="xs" />
                    ) : (
                      <StatusBadge status="UNVERIFIED" size="xs" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
