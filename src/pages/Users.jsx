import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users (Passengers)</h1>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, phone or email..."
        className="mb-5 border border-gray-200 rounded-xl px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-yellow-300"
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Phone</th>
              <th className="px-5 py-3 text-left">Rating</th>
              <th className="px-5 py-3 text-left">Total Rides</th>
              <th className="px-5 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">👤</div>
                    )}
                    <span className="font-medium text-gray-900">{user.name || '—'}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500">{user.email || '—'}</td>
                <td className="px-5 py-3 text-gray-500">{user.phone || '—'}</td>
                <td className="px-5 py-3">⭐ {user.rating?.toFixed(1) ?? '5.0'}</td>
                <td className="px-5 py-3">{user.totalRides ?? 0}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {user.createdAt?.toDate ? format(user.createdAt.toDate(), 'MMM d, yyyy') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No users found</div>
        )}
      </div>
    </div>
  );
}
