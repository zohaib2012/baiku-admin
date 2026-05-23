import { useEffect, useState } from 'react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import { format } from 'date-fns';

export default function RideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const unsub1 = onSnapshot(doc(db, 'rides', id), snap => {
      if (snap.exists()) setRide({ id: snap.id, ...snap.data() });
    });
    const unsub2 = onSnapshot(collection(db, 'rides', id, 'offers'), snap => {
      setOffers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub1(); unsub2(); };
  }, [id]);

  if (!ride) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" /></div>;

  const formatTime = ts => ts?.toDate ? format(ts.toDate(), 'MMM d yyyy, HH:mm') : '—';

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700 mb-4 flex items-center gap-1 text-sm">
        ← Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Ride Details</h2>
          <Badge status={ride.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Passenger', ride.passengerName],
            ['Passenger Phone', ride.passengerPhone],
            ['Driver', ride.driverName || '—'],
            ['Driver Phone', ride.driverPhone || '—'],
            ['Bike Plate', ride.bikePlate || '—'],
            ['Distance', `${ride.distance?.toFixed(1)} km`],
            ['Offered Price', `Rs. ${ride.passengerPrice}`],
            ['Final Price', ride.finalPrice ? `Rs. ${ride.finalPrice}` : '—'],
            ['Created', formatTime(ride.createdAt)],
            ['Completed', formatTime(ride.completedAt)],
          ].map(([k, v]) => (
            <div key={k} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-0.5">{k}</div>
              <div className="font-medium text-gray-800 text-sm">{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-3 bg-green-50 rounded-xl p-3">
            <span className="text-green-500 mt-0.5">📍</span>
            <div>
              <div className="text-xs text-green-600 font-medium">Pickup</div>
              <div className="text-sm text-gray-700">{ride.pickupAddress}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-red-50 rounded-xl p-3">
            <span className="text-red-500 mt-0.5">🏁</span>
            <div>
              <div className="text-xs text-red-600 font-medium">Drop</div>
              <div className="text-sm text-gray-700">{ride.dropAddress}</div>
            </div>
          </div>
        </div>

        {ride.cancellationReason && (
          <div className="mt-3 p-3 bg-red-50 rounded-xl text-sm text-red-700">
            Cancelled: {ride.cancellationReason} (by {ride.cancelledBy})
          </div>
        )}
      </div>

      {offers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Driver Offers ({offers.length})</h3>
          <div className="space-y-2">
            {offers.map(offer => (
              <div key={offer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-800 text-sm">{offer.driverName}</div>
                  <div className="text-xs text-gray-400">{offer.driverPhone}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">Rs. {offer.offeredPrice}</div>
                  <Badge status={offer.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
