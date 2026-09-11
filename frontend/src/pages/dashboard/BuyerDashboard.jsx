import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Handshake, Lock, Unlock, AlertTriangle, Activity, Plus } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { buyerDashboardData, recentDeals } from '../../data/mockData';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(buyerDashboardData);
      setDeals(recentDeals);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Welcome back, {user?.name}</h1>
          <p className="text-sm text-surface-500 mt-1">Here's what's happening with your deals today.</p>
        </div>
        <Button onClick={() => navigate('/deals/create')} icon={Plus}>
          Create New Deal
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Escrow Value"
          value={formatCurrency(data.totalEscrowValue)}
          icon={Activity}
          trend="up"
          trendValue="+12% from last month"
        />
        <StatCard
          title="Locked Amount"
          value={formatCurrency(data.lockedAmount)}
          icon={Lock}
          className="border-indigo-100"
        />
        <StatCard
          title="Released Amount"
          value={formatCurrency(data.releasedAmount)}
          icon={Unlock}
          className="border-accent-100"
        />
        <StatCard
          title="Active Disputes"
          value={data.activeDisputes.toString()}
          icon={AlertTriangle}
          trend="down"
          trendValue="Action required on 1"
          className="border-danger-100"
        />
      </div>

      {/* Recent Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deals</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/deals')}>View All</Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Deal</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Seller</th>
                <th className="text-right py-3 px-4 font-semibold text-surface-500">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {deals.map(deal => (
                <tr key={deal.id} className="hover:bg-surface-50 cursor-pointer" onClick={() => navigate(`/deals/${deal.id}`)}>
                  <td className="py-3 px-4 font-medium text-surface-900">{deal.title}</td>
                  <td className="py-3 px-4 text-surface-600">{deal.seller}</td>
                  <td className="py-3 px-4 text-right font-semibold text-surface-900">₹{deal.amount.toLocaleString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={deal.status} /></td>
                  <td className="py-3 px-4 text-surface-500">{deal.milestoneProgress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
