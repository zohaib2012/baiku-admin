import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'searching', 'negotiating', 'confirmed', 'driver_arrived', 'active', 'completed', 'cancelled'];

export default function Rides() {
  const [rides, setRides] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    let q;
    if (filter === 'all') {
      q = query(collection(db, 'rides'), orderBy('createdAt', 'desc'), limit(50));
    } else {
      // No orderBy on filtered queries to avoid composite index requirement
      q = query(collection(db, 'rides'), where('status', '==', filter), limit(50));
    }
    return onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort client-side by createdAt desc
      docs.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() ?? new Date(0);
        const bTime = b.createdAt?.toDate?.() ?? new Date(0);
        return bTime - aTime;
      });
      setRides(docs);
    });
  }, [filter]);

  const cancelRide = async (rideId) => {
    if (!confirm('Cancel this ride?')) return;
    await updateDoc(doc(db, 'rides', rideId), {
      status: 'cancelled',
      cancelledBy: 'admin',
      cancellationReason: 'Cancelled by admin',
    });
    toast.success('Ride cancelled');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rides</h1>

      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors
              ${filter === s ? 'bg-yellow-400 text-black' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Passenger</th>
              <th className="px-5 py-3 text-left">Driver</th>
              <th className="px-5 py-3 text-left">Route</th>
              <th className="px-5 py-3 text-left">Price</th>
              <th className="px-5 py-3 text-left">Dist.</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Time</th>
              <th className="px-5 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rides.map(ride => (
              <tr key={ride.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/rides/${ride.id}`)}>
                <td className="px-5 py-3 font-medium text-gray-800">{ride.passengerName || '—'}</td>
                <td className="px-5 py-3 text-gray-500">{ride.driverName || '—'}</td>
                <td className="px-5 py-3 text-xs text-gray-400 max-w-[160px]">
                  <div className="truncate">{ride.pickupAddress}</div>
                  <div className="truncate">→ {ride.dropAddress}</div>
                </td>
                <td className="px-5 py-3 font-medium">Rs. {ride.finalPrice || ride.passengerPrice || '—'}</td>
                <td className="px-5 py-3 text-gray-500">{ride.distance?.toFixed(1)} km</td>
                <td className="px-5 py-3" onClick={e => e.stopPropagation()}><Badge status={ride.status} /></td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {ride.createdAt?.toDate ? format(ride.createdAt.toDate(), 'MMM d, HH:mm') : '—'}
                </td>
                <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                  {['searching', 'negotiating', 'confirmed', 'active'].includes(ride.status) && (
                    <button
                      onClick={() => cancelRide(ride.id)}
                      className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rides.length === 0 && (
          <div className="text-center py-12 text-gray-400">No rides found</div>
        )}
      </div>
    </div>
  );
}
