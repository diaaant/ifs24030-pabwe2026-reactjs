import { IconX } from "@tabler/icons-react";

export default function ModalShell({ title, onClose, children }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <IconX size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
