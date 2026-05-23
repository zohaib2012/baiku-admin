const colors = {
  pending:        'bg-yellow-100 text-yellow-800',
  approved:       'bg-green-100 text-green-800',
  rejected:       'bg-red-100 text-red-800',
  searching:      'bg-blue-100 text-blue-800',
  negotiating:    'bg-purple-100 text-purple-800',
  confirmed:      'bg-indigo-100 text-indigo-800',
  driver_arrived: 'bg-cyan-100 text-cyan-800',
  active:         'bg-emerald-100 text-emerald-800',
  completed:      'bg-gray-100 text-gray-800',
  cancelled:      'bg-red-100 text-red-700',
  online:         'bg-green-100 text-green-700',
  offline:        'bg-gray-100 text-gray-500',
};

export default function Badge({ status }) {
  const cls = colors[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
