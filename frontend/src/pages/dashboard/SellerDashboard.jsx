import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Handshake, Lock, Unlock, FileText, Star, Inbox } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { sellerDashboardData, recentDeals } from '../../data/mockData';

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setData(sellerDashboardData);
      setDeals(recentDeals.filter(d => d.seller.includes('Sharma') || d.seller.includes('Metal'))); // Mock filter
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
          <h1 className="text-2xl font-bold text-surface-900">Seller Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">Manage your incoming orders and milestone evidence.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Trust Score"
          value={data.trustScore}
          icon={Star}
          trend="up"
          trendValue="Top 15% of sellers"
          className="border-accent-100"
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
          title="Pending Evidence"
          value={data.pendingEvidence.toString()}
          icon={FileText}
          trend="down"
          trendValue="Action required on 2"
          className="border-warning-100"
        />
      </div>

      {/* Incoming / Active Deals Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/deals')}>View All</Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-3 px-4 font-semibold text-surface-500">Deal</th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-500">Buyer</th>
                    <th className="text-right py-3 px-4 font-semibold text-surface-500">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {deals.map(deal => (
                    <tr key={deal.id} className="hover:bg-surface-50 cursor-pointer" onClick={() => navigate(`/deals/${deal.id}`)}>
                      <td className="py-3 px-4 font-medium text-surface-900">{deal.title}</td>
                      <td className="py-3 px-4 text-surface-600">{deal.buyer}</td>
                      <td className="py-3 px-4 text-right font-semibold text-surface-900">₹{deal.amount.toLocaleString()}</td>
                      <td className="py-3 px-4"><StatusBadge status={deal.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full bg-brand-50/50 border-brand-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-brand-600" />
                Incoming Requests
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-brand-200 shadow-sm cursor-pointer hover:border-brand-300">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">200 Office Desks</h4>
                  <span className="text-xs font-bold text-brand-700">₹1.8L</span>
                </div>
                <p className="text-xs text-surface-500 mb-3">From: Tech Solutions Pvt Ltd</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" className="flex-1">Accept</Button>
                  <Button size="sm" variant="secondary" className="flex-1">Decline</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
