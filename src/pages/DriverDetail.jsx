import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import ImageModal from '../components/ImageModal';
import toast from 'react-hot-toast';

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => {
    return onSnapshot(doc(db, 'drivers', id), snap => {
      if (snap.exists()) setDriver({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  const approve = async () => {
    await updateDoc(doc(db, 'drivers', id), { status: 'approved' });
    toast.success('Driver approved!');
  };

  const reject = async () => {
    const reason = prompt('Rejection reason:') || 'Does not meet requirements';
    await updateDoc(doc(db, 'drivers', id), { status: 'rejected', rejectionReason: reason });
    toast.success('Driver rejected');
  };

  if (!driver) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" /></div>;

  const docs = [
    { label: 'CNIC Front', url: driver.cnicFrontUrl },
    { label: 'CNIC Back', url: driver.cnicBackUrl },
    { label: 'License', url: driver.licensePhotoUrl },
    { label: 'Bike Photo', url: driver.bikePhotoUrl },
    { label: 'Profile Photo', url: driver.photoUrl },
  ];

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700 mb-4 flex items-center gap-1 text-sm">
        ← Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {driver.photoUrl ? (
              <img src={driver.photoUrl} className="w-16 h-16 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">🏍️</div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{driver.name}</h2>
              <p className="text-gray-500">{driver.phone}</p>
              <Badge status={driver.status} />
            </div>
          </div>
          {driver.status === 'pending' && (
            <div className="flex gap-3">
              <button onClick={approve} className="px-5 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600">
                ✓ Approve
              </button>
              <button onClick={reject} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600">
                ✗ Reject
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['CNIC Number', driver.cnicNumber],
            ['License Number', driver.licenseNumber],
            ['Bike Make', driver.bikeMake],
            ['Bike Model', driver.bikeModel],
            ['Bike Year', driver.bikeYear],
            ['Bike Plate', driver.bikePlate],
            ['Total Rides', driver.totalRides ?? 0],
            ['Rating', `⭐ ${driver.rating?.toFixed(1) ?? '5.0'}`],
            ['Earnings', `Rs. ${driver.earnings ?? 0}`],
          ].map(([k, v]) => (
            <div key={k} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">{k}</div>
              <div className="font-medium text-gray-800">{v}</div>
            </div>
          ))}
        </div>

        {driver.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl">
            <p className="text-xs text-red-400 mb-1">Rejection Reason</p>
            <p className="text-sm text-red-700">{driver.rejectionReason}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Documents</h3>
        <div className="grid grid-cols-3 gap-4">
          {docs.map(({ label, url }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 mb-2">{label}</p>
              {url ? (
                <img
                  src={url}
                  alt={label}
                  onClick={() => setModalImg(url)}
                  className="w-full h-32 object-cover rounded-xl border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="w-full h-32 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                  No image
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ImageModal src={modalImg} onClose={() => setModalImg(null)} />
    </div>
  );
}
