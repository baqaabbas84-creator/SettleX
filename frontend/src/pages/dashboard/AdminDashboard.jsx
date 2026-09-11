import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { adminAnalytics, adminUsers } from '../../data/mockData';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setData(adminAnalytics);
      setUsers(adminUsers);
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-surface-500">Loading dashboard...</div>;
  }

  const formatCurrency = (amount) => `₹${(amount / 100000).toFixed(1)}L`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Platform Overview</h1>
        <p className="text-sm text-surface-500 mt-1">System-wide metrics and administrative actions.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transaction Value"
          value={formatCurrency(data.totalTransactionValue)}
          icon={Activity}
          trend="up"
          trendValue="+18% this month"
        />
        <StatCard
          title="System Locked Escrow"
          value={formatCurrency(data.lockedAmount)}
          icon={Lock}
          className="border-indigo-100"
        />
        <StatCard
          title="Open Disputes"
          value={data.openDisputes.toString()}
          icon={AlertTriangle}
          trend="down"
          trendValue="Requires attention"
          className="border-danger-100"
        />
        <StatCard
          title="Avg Trust Score"
          value={data.avgTrustScore.toString()}
          icon={ShieldCheck}
          trend="up"
          trendValue="Healthy network"
          className="border-accent-100"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users Registration</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-3 px-4 font-semibold text-surface-500">User</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Company</th>
                <th className="text-center py-3 px-4 font-semibold text-surface-500">Trust Score</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-surface-50">
                  <td className="py-3 px-4 font-medium text-surface-900">{user.name}</td>
                  <td className="py-3 px-4"><span className="text-xs font-semibold bg-surface-100 px-2 py-1 rounded">{user.role}</span></td>
                  <td className="py-3 px-4 text-surface-600">{user.company}</td>
                  <td className="py-3 px-4 text-center font-bold text-surface-900">{user.trustScore || 'N/A'}</td>
                  <td className="py-3 px-4">
                    {user.verified ? (
                      <StatusBadge status="VERIFIED" />
                    ) : (
                      <StatusBadge status="UNVERIFIED" />
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
