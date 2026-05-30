import { useEffect } from 'react';

export default function ImageModal({ src, onClose }) {
  useEffect(() => {
    if (!src) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 fade-in backdrop-blur-md"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <img
          src={src}
          alt="Document"
          className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl scale-in"
        />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-gray-900 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-700 transition-all shadow-lg ring-2 ring-white/20 hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="absolute bottom-6 text-white/50 text-xs flex items-center gap-3">
        <span>Click outside or press ESC to close</span>
      </div>
    </div>
  );
}
