import { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: null,
    totalDrivers: null,
    pendingDrivers: null,
    onlineDrivers: null,
    todayRides: null,
    completedRides: null,
    activeRides: null,
  });
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [
        usersSnap,
        driversSnap,
        pendingSnap,
        onlineSnap,
        completedSnap,
        activeSnap,
        todaySnap,
      ] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'drivers')),
        getCountFromServer(query(collection(db, 'drivers'), where('status', '==', 'pending'))),
        getCountFromServer(query(collection(db, 'drivers'), where('isOnline', '==', true))),
        getCountFromServer(query(collection(db, 'rides'), where('status', '==', 'completed'))),
        getCountFromServer(query(collection(db, 'rides'), where('status', 'in', ['active', 'confirmed', 'driver_arrived']))),
        getCountFromServer(query(collection(db, 'rides'), where('createdAt', '>=', todayStart))),
      ]);

      setStats({
        totalUsers: usersSnap.data().count,
        totalDrivers: driversSnap.data().count,
        pendingDrivers: pendingSnap.data().count,
        onlineDrivers: onlineSnap.data().count,
        todayRides: todaySnap.data().count,
        completedRides: completedSnap.data().count,
        activeRides: activeSnap.data().count,
      });

      const recentSnap = await getDocs(
        query(collection(db, 'rides'), orderBy('createdAt', 'desc'), limit(5))
      );
      setRecentRides(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users"       value={stats.totalUsers}     icon="👥" color="blue" />
        <StatCard title="Total Drivers"     value={stats.totalDrivers}   icon="🏍️" color="green" />
        <StatCard title="Pending Approval"  value={stats.pendingDrivers} icon="⏳" color="yellow" />
        <StatCard title="Online Drivers"    value={stats.onlineDrivers}  icon="🟢" color="green" />
        <StatCard title="Today's Rides"     value={stats.todayRides}     icon="📍" color="blue" />
        <StatCard title="Active Rides"      value={stats.activeRides}    icon="🚗" color="yellow" />
        <StatCard title="Completed Rides"   value={stats.completedRides} icon="✅" color="green" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Rides</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Passenger</th>
                <th className="px-5 py-3 text-left">Pickup</th>
                <th className="px-5 py-3 text-left">Drop</th>
                <th className="px-5 py-3 text-left">Price</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentRides.map(ride => (
                <tr key={ride.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{ride.passengerName || '—'}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-[140px] truncate">{ride.pickupAddress}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-[140px] truncate">{ride.dropAddress}</td>
                  <td className="px-5 py-3 font-medium">Rs. {ride.finalPrice || ride.passengerPrice}</td>
                  <td className="px-5 py-3"><Badge status={ride.status} /></td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {ride.createdAt?.toDate ? format(ride.createdAt.toDate(), 'MMM d, HH:mm') : '—'}
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
