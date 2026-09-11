import { ClipboardList, ShieldCheck, Search, Filter, Calendar } from 'lucide-react';
import { useState } from 'react';

const AUDIT_LOGS = [
  { id: 'LOG-9912', action: 'DEAL_CREATED', actor: 'Rajesh Kumar (Buyer)', target: 'Deal #deal_001', date: '2026-09-01 10:15:22', ip: '10.58.31.177', status: 'SUCCESS' },
  { id: 'LOG-9913', action: 'DEAL_ACCEPTED', actor: 'Priya Sharma (Seller)', target: 'Deal #deal_001', date: '2026-09-02 14:40:11', ip: '10.58.31.201', status: 'SUCCESS' },
  { id: 'LOG-9914', action: 'ESCROW_LOCKED', actor: 'SettleX Smart Contract', target: '₹2,50,000 Allocation', date: '2026-09-03 09:00:04', ip: 'System', status: 'SUCCESS' },
  { id: 'LOG-9915', action: 'EVIDENCE_SUBMITTED', actor: 'Priya Sharma (Seller)', target: 'design_specs_rev2.pdf', date: '2026-09-08 14:30:45', ip: '10.58.31.201', status: 'SUCCESS' },
  { id: 'LOG-9916', action: 'MILESTONE_APPROVED', actor: 'Rajesh Kumar (Buyer)', target: 'Milestone 1 — ₹25,000', date: '2026-09-10 16:15:30', ip: '10.58.31.177', status: 'SUCCESS' },
  { id: 'LOG-9917', action: 'MILESTONE_RELEASED', actor: 'Escrow Core Vault', target: 'Disbursement to Seller', date: '2026-09-10 16:15:32', ip: 'System', status: 'SUCCESS' },
];

export default function AdminAudit() {
  const [search, setSearch] = useState('');

  const filtered = AUDIT_LOGS.filter(l =>
    l.id.toLowerCase().includes(search.toLowerCase()) ||
    l.actor.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
          <ClipboardList className="w-4 h-4" />
          <span>Security & Compliance</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900">System Audit Trail</h1>
        <p className="text-sm text-surface-500 mt-1">Immutable record of every cryptographic transition, auth verification, and escrow movement.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit logs by actor, action type, log ID..."
          className="w-full px-4 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Log ID</th>
                <th className="px-5 py-3.5">Action Event</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 font-mono">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-surface-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-surface-900">{log.id}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-brand-50 text-brand-700 border border-brand-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-sans font-medium text-surface-800">{log.actor}</td>
                  <td className="px-5 py-3.5 font-sans text-surface-600">{log.target}</td>
                  <td className="px-5 py-3.5 text-surface-400">{log.ip}</td>
                  <td className="px-5 py-3.5 text-right text-surface-500">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
