import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';

export default function PendingDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'drivers'), where('status', '==', 'pending'));
    return onSnapshot(q, snap => {
      setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const approve = async (driverId) => {
    await updateDoc(doc(db, 'drivers', driverId), { status: 'approved' });
    toast.success('Driver approved!');
  };

  const reject = async (driverId) => {
    const reason = prompt('Rejection reason (optional):') || 'Does not meet requirements';
    await updateDoc(doc(db, 'drivers', driverId), {
      status: 'rejected',
      rejectionReason: reason,
    });
    toast.success('Driver rejected');
  };

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Pending Approval
        {drivers.length > 0 && (
          <span className="ml-2 bg-yellow-100 text-yellow-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {drivers.length}
          </span>
        )}
      </h1>

      {drivers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-gray-500">No pending driver applications</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {drivers.map(driver => (
            <div key={driver.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {driver.photoUrl ? (
                    <img src={driver.photoUrl} alt={driver.name} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl">🏍️</div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{driver.name}</h3>
                    <p className="text-gray-500 text-sm">{driver.phone}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {driver.bikeMake} {driver.bikeModel} {driver.bikeYear} · {driver.bikePlate}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/drivers/${driver.id}`)}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    View Docs
                  </button>
                  <button
                    onClick={() => approve(driver.id)}
                    className="px-4 py-2 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => reject(driver.id)}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-3">
                {[
                  { label: 'CNIC Front', url: driver.cnicFrontUrl },
                  { label: 'CNIC Back', url: driver.cnicBackUrl },
                  { label: 'License', url: driver.licensePhotoUrl },
                  { label: 'Bike Photo', url: driver.bikePhotoUrl },
                ].map(({ label, url }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer">
                        <img
                          src={url}
                          alt={label}
                          className="w-full h-20 object-cover rounded-xl border border-gray-100 hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      </a>
                    ) : (
                      <div className="w-full h-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-6 text-xs text-gray-500">
                <span>CNIC: <strong className="text-gray-700">{driver.cnicNumber}</strong></span>
                <span>License: <strong className="text-gray-700">{driver.licenseNumber}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
