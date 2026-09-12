import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { Users, Search, CheckCircle2, XCircle, ShieldCheck, Filter, UserCheck, RotateCw } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';

const MOCK_USERS = [
  { id: 'usr_001', name: 'Rajesh Kumar', email: 'rajesh@kumartrading.in', company: 'Kumar Trading Co.', role: 'BUYER', verificationStatus: 'VERIFIED', trustScore: 94, dealsCount: 24 },
  { id: 'usr_002', name: 'Priya Sharma', email: 'priya@sharmafurniture.in', company: 'Sharma Furniture Works', role: 'SELLER', verificationStatus: 'VERIFIED', trustScore: 87, dealsCount: 18 },
  { id: 'usr_003', name: 'Amit Patel', email: 'amit@metalcraft.in', company: 'MetalCraft Fabrications', role: 'SELLER', verificationStatus: 'VERIFIED', trustScore: 92, dealsCount: 12 },
  { id: 'usr_004', name: 'Vikram Singh', email: 'vikram@apexsupplies.in', company: 'Apex Industrial Supplies', role: 'SELLER', verificationStatus: 'PENDING', trustScore: null, dealsCount: 1 },
  { id: 'usr_005', name: 'Sunil Mehta', email: 'sunil@mehtainteriors.in', company: 'Mehta Commercial Interiors', role: 'BUYER', verificationStatus: 'VERIFIED', trustScore: 91, dealsCount: 8 },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filtered = users.filter((u) => {
    const match = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.company.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    if (!match) return false;
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    return true;
  });

  const toggleVerify = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const next = u.verificationStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
        return { ...u, verificationStatus: next };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" />
          <span>Platform User Directory</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900">User Management & KYC Verification</h1>
        <p className="text-sm text-surface-500 mt-1">Audit onboarding businesses, verify GST credentials, and manage role permissions.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users, companies, emails..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white w-full sm:w-auto"
        >
          <option value="ALL">All Roles</option>
          <option value="BUYER">Buyers</option>
          <option value="SELLER">Sellers</option>
          <option value="ADMIN">Platform Admins</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Business & Contact</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Verification</th>
                <th className="px-5 py-3.5 text-center">Trust Score</th>
                <th className="px-5 py-3.5 text-center">Total Deals</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-surface-900 text-sm">{u.company}</p>
                    <p className="text-surface-500">{u.name} • {u.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${
                      u.role === 'BUYER' ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={u.verificationStatus} size="xs" />
                  </td>
                  <td className="px-5 py-4 text-center font-mono font-bold text-surface-900">
                    {u.trustScore ? `${u.trustScore} / 100` : <span className="text-surface-400 font-normal">New (N/A)</span>}
                  </td>
                  <td className="px-5 py-4 text-center font-bold font-mono text-surface-800">
                    {u.dealsCount}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => toggleVerify(u.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        u.verificationStatus === 'VERIFIED'
                          ? 'bg-danger-50 text-danger-700 hover:bg-danger-100'
                          : 'bg-accent-600 text-white hover:bg-accent-700'
                      }`}
                    >
                      {u.verificationStatus === 'VERIFIED' ? 'Revoke KYC' : 'Verify KYC'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
