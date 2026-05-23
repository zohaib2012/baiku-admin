export default function ImageModal({ src, onClose }) {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <img
        src={src}
        alt="Document"
        className="max-w-full max-h-full rounded-xl object-contain"
        onClick={e => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 text-xl"
      >✕</button>
    </div>
  );
}
