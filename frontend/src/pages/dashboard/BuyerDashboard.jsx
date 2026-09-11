import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Handshake,
  Lock,
  Unlock,
  AlertTriangle,
  Activity,
  Plus,
  Receipt,
  FileCheck,
  ShieldCheck,
  Clock,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
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
    let custom = [];
    try {
      custom = JSON.parse(localStorage.getItem('settlex_custom_deals') || '[]');
    } catch {
      custom = [];
    }

    setData(buyerDashboardData);
    setDeals([...custom, ...recentDeals]);
    setLoading(false);
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-surface-500">Loading dashboard...</div>;
  }

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const pendingApprovalsCount = deals.filter(
    (d) => d.milestones?.some((m) => m.status === 'UNDER_REVIEW' || m.status === 'EVIDENCE_SUBMITTED')
  ).length || 1;

  const recentTransactions = [
    { id: 'TXN-9081', desc: 'Escrow Lock: 500 Wooden Chairs', amount: 225000, date: 'Sep 03', type: 'LOCK' },
    { id: 'TXN-9083', desc: 'Milestone 1 Release: Priya Sharma', amount: 25000, date: 'Sep 10', type: 'RELEASE' },
    { id: 'TXN-9084', desc: 'Escrow Lock: Warehouse Shelving', amount: 180000, date: 'Sep 12', type: 'LOCK' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Welcome back, {user?.name || 'Partner'}</h1>
          <p className="text-sm text-surface-500 mt-1">
            Buyer Dashboard • {user?.company || 'Kumar Trading Co.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/deals/create')} icon={Plus}>
            Create New Deal
          </Button>
        </div>
      </div>

      {/* KPI Cards: Buyer Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Escrow Locked"
          value={formatCurrency(data.lockedAmount)}
          icon={Lock}
          className="border-indigo-100"
          trend="up"
          trendValue="Active in escrow"
        />
        <StatCard
          title="Released to Sellers"
          value={formatCurrency(data.releasedAmount)}
          icon={Unlock}
          className="border-accent-100"
          trend="up"
          trendValue="Satisfied milestones"
        />
        <StatCard
          title="Pending Approvals"
          value={`${pendingApprovalsCount} Milestones`}
          icon={FileCheck}
          className="border-warning-100"
          trend="down"
          trendValue="Requires signoff"
        />
        <StatCard
          title="Open Disputes"
          value={data.activeDisputes.toString()}
          icon={AlertTriangle}
          className="border-danger-100"
          trend="down"
          trendValue="1 in arbitration"
        />
      </div>

      {/* Active Milestone Progress Bar Card */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <span>Current Milestone Execution Tracker</span>
            </h3>
            <p className="text-xs text-surface-500">
              Deal: 500 Wooden Chairs — Stage 2: Batch Manufacturing QA (75% of funds secured)
            </p>
          </div>
          <Button size="xs" variant="outline" onClick={() => navigate('/deals/deal_001')}>
            Review Stage Evidence
          </Button>
        </div>
        <div className="h-2.5 rounded-full bg-surface-100 overflow-hidden flex">
          <div className="h-full bg-accent-500" style={{ width: '40%' }} title="M1 Approved" />
          <div className="h-full bg-brand-500 animate-pulse" style={{ width: '35%' }} title="M2 Under Review" />
        </div>
        <div className="flex justify-between text-[11px] text-surface-500 mt-2">
          <span>Stage 1: Design (Released)</span>
          <span className="font-semibold text-brand-700">Stage 2: Production QA (Active)</span>
          <span>Stage 3: Delivery (Pending)</span>
        </div>
      </div>

      {/* Grid: Recent Deals & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Deals Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Active & Proposed Deals</CardTitle>
                <p className="text-xs text-surface-400 mt-0.5">Track supplier commitments and milestone statuses.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/deals')}>View All</Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-200 text-surface-500 text-left uppercase">
                    <th className="py-3 px-4 font-semibold">Deal</th>
                    <th className="py-3 px-4 font-semibold">Seller</th>
                    <th className="py-3 px-4 text-right font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 text-center font-semibold">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {deals.slice(0, 5).map((deal) => {
                    const id = deal.id || deal._id;
                    const sellerName = deal.seller?.company || deal.seller?.name || deal.seller;
                    const amt = deal.totalAmount || deal.amount || 250000;
                    return (
                      <tr
                        key={id}
                        className="hover:bg-surface-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/deals/${id}`)}
                      >
                        <td className="py-3.5 px-4 font-bold text-surface-900 max-w-[200px] truncate">
                          {deal.title}
                        </td>
                        <td className="py-3.5 px-4 text-surface-600">{sellerName}</td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-surface-900">
                          {formatCurrency(amt)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={deal.status} size="xs" />
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-surface-600">
                          {deal.milestoneProgress || '1/3'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Recent Transactions Ledger */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-brand-600" />
                Recent Escrow Ledger
              </CardTitle>
              <Button variant="ghost" size="xs" onClick={() => navigate('/transactions')}>
                Ledger
              </Button>
            </CardHeader>
            <div className="space-y-3 p-4 pt-0">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="p-3 bg-surface-50 rounded-xl border border-surface-100 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-surface-900 truncate max-w-[150px]">{tx.desc}</p>
                    <span className="text-[11px] text-surface-400">{tx.id} • {tx.date}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-surface-900">{formatCurrency(tx.amount)}</p>
                    <span className={`text-[10px] font-bold ${tx.type === 'RELEASE' ? 'text-accent-600' : 'text-indigo-600'}`}>
                      {tx.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Trust Score Widget */}
          <div className="p-4 rounded-xl bg-accent-50/70 border border-accent-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-accent-900 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-accent-600" />
                Your Buyer Trust Rating
              </span>
              <strong className="text-sm font-mono text-accent-900">96.8 / 100</strong>
            </div>
            <p className="text-accent-800 text-[11px] mt-1">
              Top 5% prompt release on satisfied milestones. Fosters preferential terms from sellers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
