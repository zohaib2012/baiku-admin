import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';

export default function AllDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'drivers'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const toggleStatus = async (driver) => {
    const newStatus = driver.status === 'approved' ? 'rejected' : 'approved';
    await updateDoc(doc(db, 'drivers', driver.id), { status: newStatus });
    toast.success(`Driver ${newStatus}`);
  };

  const filtered = drivers
    .filter(d => filter === 'all' || d.status === filter)
    .filter(d => !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.phone?.includes(search));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Drivers</h1>

      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors
              ${filter === s ? 'bg-yellow-400 text-black' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Driver</th>
              <th className="px-5 py-3 text-left">Phone</th>
              <th className="px-5 py-3 text-left">Bike</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Online</th>
              <th className="px-5 py-3 text-left">Rides</th>
              <th className="px-5 py-3 text-left">Rating</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(driver => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {driver.photoUrl ? (
                      <img src={driver.photoUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">🏍️</div>
                    )}
                    <span className="font-medium text-gray-900">{driver.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500">{driver.phone}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{driver.bikeMake} {driver.bikePlate}</td>
                <td className="px-5 py-3"><Badge status={driver.status} /></td>
                <td className="px-5 py-3">
                  <Badge status={driver.isOnline ? 'online' : 'offline'} />
                </td>
                <td className="px-5 py-3 text-gray-700">{driver.totalRides ?? 0}</td>
                <td className="px-5 py-3 text-gray-700">⭐ {driver.rating?.toFixed(1) ?? '5.0'}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/drivers/${driver.id}`)}
                      className="text-xs px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      View
                    </button>
                    {driver.status === 'approved' && (
                      <button
                        onClick={() => toggleStatus(driver)}
                        className="text-xs px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100"
                      >
                        Disable
                      </button>
                    )}
                    {driver.status === 'rejected' && (
                      <button
                        onClick={() => toggleStatus(driver)}
                        className="text-xs px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg hover:bg-green-100"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No drivers found</div>
        )}
      </div>
    </div>
  );
}
