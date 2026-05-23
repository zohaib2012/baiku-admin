export default function StatCard({ title, value, icon, color = 'yellow', sub }) {
  const colorMap = {
    yellow: 'bg-yellow-50 text-yellow-600',
    green:  'bg-green-50 text-green-600',
    blue:   'bg-blue-50 text-blue-600',
    red:    'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <span className={`p-2 rounded-xl text-xl ${colorMap[color]}`}>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-800">{value ?? '—'}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}
