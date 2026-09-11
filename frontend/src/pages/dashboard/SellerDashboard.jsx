import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Handshake,
  Lock,
  Unlock,
  FileText,
  Star,
  Inbox,
  AlertTriangle,
  Receipt,
  Upload,
  Clock,
  ShieldCheck,
  ChevronRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
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
    let custom = [];
    try {
      custom = JSON.parse(localStorage.getItem('settlex_custom_deals') || '[]');
    } catch {
      custom = [];
    }

    setData(sellerDashboardData);
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

  const incomingRequests = [
    { id: 'deal_inc_001', title: '500 Ergonomic Workstation Chairs', buyer: 'Kumar Trading Co.', amount: 250000, milestones: 3 },
    { id: 'deal_inc_002', title: 'Bulk Teak Wood Timber Supply Batch 4', buyer: 'Mehta Commercial Interiors', amount: 420000, milestones: 4 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Seller Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">
            Supplier Portal • {user?.company || 'Sharma Furniture Works'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/evidence')} icon={Upload}>
            Submit Evidence
          </Button>
          <Button onClick={() => navigate('/deals/incoming')} icon={Inbox}>
            Incoming Queue
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Trust Score"
          value={`${data.trustScore} / 100`}
          icon={Star}
          trend="up"
          trendValue="Top 15% Verified Sellers"
          className="border-accent-100"
        />
        <StatCard
          title="Locked in Escrow"
          value={formatCurrency(data.lockedAmount)}
          icon={Lock}
          className="border-indigo-100"
          trend="up"
          trendValue="Secured for your orders"
        />
        <StatCard
          title="Settled & Released"
          value={formatCurrency(data.releasedAmount)}
          icon={Unlock}
          className="border-accent-100"
          trend="up"
          trendValue="Disbursed directly"
        />
        <StatCard
          title="Pending Evidence"
          value={`${data.pendingEvidence} Documents`}
          icon={FileText}
          trend="down"
          trendValue="Required for next releases"
          className="border-warning-100"
        />
      </div>

      {/* Incoming Requests Action Strip */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-brand-600">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900">
              You have {incomingRequests.length} pending deal proposals
            </h3>
            <p className="text-xs text-surface-500">
              Buyers have committed escrow allocations awaiting your agreement acceptance.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => navigate('/deals/incoming')}>
          Review Incoming Queue
        </Button>
      </div>

      {/* Grid: Active Orders & Evidence Dispatch Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Active Orders Under Escrow</CardTitle>
                <p className="text-xs text-surface-400 mt-0.5">Manufacturing & delivery contracts in progress.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/deals/active')}>View All</Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-200 text-surface-500 text-left uppercase">
                    <th className="py-3 px-4 font-semibold">Deal</th>
                    <th className="py-3 px-4 font-semibold">Buyer</th>
                    <th className="py-3 px-4 text-right font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {deals.slice(0, 5).map((deal) => {
                    const id = deal.id || deal._id;
                    const buyerName = deal.buyer?.company || deal.buyer?.name || deal.buyer;
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
                        <td className="py-3.5 px-4 text-surface-600">{buyerName}</td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-surface-900">
                          {formatCurrency(amt)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={deal.status} size="xs" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-brand-600 font-semibold hover:underline">
                            Details →
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Pending Evidence Checklist */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-warning-600" />
                Required Evidence Uploads
              </CardTitle>
              <Button variant="ghost" size="xs" onClick={() => navigate('/evidence')}>
                All Docs
              </Button>
            </CardHeader>
            <div className="space-y-3 p-4 pt-0">
              <div className="p-3 bg-warning-50/50 rounded-xl border border-warning-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-warning-900">
                  <span>Factory QC Certificate</span>
                  <span className="text-brand-700">₹1,25,000 release</span>
                </div>
                <p className="text-surface-600 text-[11px]">
                  500 Chairs • Batch 1 manufacturing completion inspection.
                </p>
                <div className="pt-2 flex justify-end">
                  <Button size="xs" onClick={() => navigate('/evidence')} icon={Upload}>
                    Upload Certificate
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-surface-900">
                  <span>Delivery Receipt & E-Way Bill</span>
                  <span className="text-surface-500">₹1,00,000 release</span>
                </div>
                <p className="text-surface-500 text-[11px]">
                  Warehouse Shelving • Final delivery confirmation signature.
                </p>
              </div>
            </div>
          </Card>

          {/* Trust Score Quick Summary */}
          <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-surface-700">Trust Performance Rating</span>
              <strong className="text-accent-700 font-bold">Grade A</strong>
            </div>
            <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
              <div className="h-full bg-accent-500" style={{ width: '87%' }} />
            </div>
            <div className="flex justify-between text-[11px] text-surface-500">
              <span>92% On-Time Delivery</span>
              <span className="text-brand-600 font-semibold cursor-pointer" onClick={() => navigate('/trust')}>
                View Breakdown →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
