import StatusBadge from '../ui/StatusBadge';

function formatCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function TransactionTable({ transactions = [], className = '' }) {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Date</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Deal</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Type</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Amount</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Reference</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {transactions.map((txn) => (
            <tr key={txn.id} className="hover:bg-surface-50 transition-colors">
              <td className="py-3 px-4 text-surface-600 whitespace-nowrap">{txn.date}</td>
              <td className="py-3 px-4 text-surface-900 font-medium max-w-[200px] truncate">{txn.deal}</td>
              <td className="py-3 px-4">
                <StatusBadge status={txn.type} size="xs" />
              </td>
              <td className="py-3 px-4 text-right font-semibold text-surface-900 whitespace-nowrap">
                {formatCurrency(txn.amount)}
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={txn.status} size="xs" />
              </td>
              <td className="py-3 px-4 text-surface-500 font-mono text-xs">{txn.reference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
