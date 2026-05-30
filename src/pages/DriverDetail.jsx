import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import ImageModal from '../components/ImageModal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [modalImg, setModalImg] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    return onSnapshot(doc(db, 'drivers', id), snap => {
      if (snap.exists()) setDriver({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  const approve = async () => {
    try {
      await updateDoc(doc(db, 'drivers', id), { status: 'approved' });
      toast.success('Driver approved!');
    } catch {
      toast.error('Failed to approve driver');
    }
  };

  const reject = async () => {
    try {
      await updateDoc(doc(db, 'drivers', id), {
        status: 'rejected',
        rejectionReason: rejectReason || 'Does not meet requirements',
      });
      toast.success('Driver rejected');
      setShowRejectModal(false);
      setRejectReason('');
    } catch {
      toast.error('Failed to reject driver');
    }
  };

  if (!driver) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-5 skeleton rounded w-20 mb-4" />
      <div className="bg-white rounded-2xl border border-indigo-100/30 p-6 space-y-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 skeleton rounded-full" />
          <div className="space-y-2">
            <div className="h-6 skeleton rounded w-40" />
            <div className="h-4 skeleton rounded w-28" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      </div>
    </div>
  );

  const docs = [
    { label: 'CNIC Front', url: driver.cnicFrontUrl },
    { label: 'CNIC Back', url: driver.cnicBackUrl },
    { label: 'License', url: driver.licensePhotoUrl },
    { label: 'Bike Photo', url: driver.bikePhotoUrl },
    { label: 'Profile Photo', url: driver.photoUrl },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-indigo-600 flex items-center gap-1.5 text-sm transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            {driver.photoUrl ? (
              <img src={driver.photoUrl} className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-100" alt="" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center text-3xl ring-2 ring-indigo-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-indigo-400">
                  <path d="M5 17h14l3-8H2l3 8z" />
                  <circle cx="8" cy="18" r="2" />
                  <circle cx="16" cy="18" r="2" />
                </svg>
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{driver.name}</h2>
                <Badge status={driver.status} />
              </div>
              <p className="text-gray-500 text-sm">{driver.phone}</p>
            </div>
          </div>
          {driver.status === 'pending' && (
            <div className="flex gap-3">
              <button onClick={approve} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Approve
              </button>
              <button onClick={() => setShowRejectModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Reject
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ['CNIC Number', driver.cnicNumber],
            ['License Number', driver.licenseNumber],
            ['Bike Make', driver.bikeMake],
            ['Bike Model', driver.bikeModel],
            ['Bike Year', driver.bikeYear],
            ['Bike Plate', driver.bikePlate],
            ['Total Rides', driver.totalRides ?? 0],
            ['Rating', `${driver.rating?.toFixed(1) ?? '5.0'} ⭐`],
            ['Earnings', `Rs. ${driver.earnings ?? 0}`],
          ].map(([k, v]) => (
            <div key={k} className="bg-indigo-50/30 rounded-xl p-3 hover:bg-indigo-50/50 transition-colors">
              <div className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wider">{k}</div>
              <div className="font-medium text-gray-800">{v || <span className="text-gray-300 italic">—</span>}</div>
            </div>
          ))}
        </div>

        {driver.rejectionReason && (
          <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-rose-500 mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="text-[11px] text-rose-400 font-medium uppercase tracking-wider mb-0.5">Rejection Reason</p>
                <p className="text-sm text-rose-700">{driver.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Documents
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {docs.map(({ label, url }) => (
            <div key={label}>
              <p className="text-[11px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">{label}</p>
              {url ? (
                <img
                  src={url}
                  alt={label}
                  onClick={() => setModalImg(url)}
                  className="w-full h-28 object-cover rounded-xl border border-indigo-100/30 cursor-pointer hover:opacity-80 hover:shadow-md transition-all"
                />
              ) : (
                <div className="w-full h-28 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                  No image
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ImageModal src={modalImg} onClose={() => setModalImg(null)} />
      <ConfirmModal
        open={showRejectModal}
        title="Reject Driver"
        message="Are you sure you want to reject this driver's application?"
        confirmLabel="Reject"
        cancelLabel="Cancel"
        danger
        onConfirm={reject}
        onCancel={() => setShowRejectModal(false)}
      />
    </div>
  );
}
