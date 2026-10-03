import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ModalShell from "../../../components/ModalShell";
import useInput from "../../../hooks/useInput";
import { asyncChangeLostFound } from "../states/lostFoundThunks";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

export default function ChangeModal({ item, onClose }) {
  const dispatch = useDispatch();
  const { isLostFoundChange, isLostFoundChanged } = useSelector((state) => state.lostFounds);
  const [title, onTitleChange] = useInput(item.title);
  const [description, onDescriptionChange] = useInput(item.description);
  const [completed, setCompleted] = useState(Boolean(item.is_completed));

  useEffect(() => {
    if (isLostFoundChanged) onClose();
  }, [isLostFoundChanged, onClose]);

  const onSubmit = (event) => {
    event.preventDefault();
    dispatch(
      asyncChangeLostFound(item.id, {
        title,
        description,
        status: item.status,
        is_completed: completed ? 1 : 0,
      }),
    );
  };

  return (
    <ModalShell title="Ubah laporan" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="change-title" className="mb-1.5 block text-sm font-semibold">Judul</label>
          <input id="change-title" required value={title} onChange={onTitleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="change-description" className="mb-1.5 block text-sm font-semibold">Deskripsi</label>
          <textarea id="change-description" required rows={4} value={description} onChange={onDescriptionChange} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} className="h-4 w-4 accent-teal-700" />
          Tandai laporan sudah selesai
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100">
            Batal
          </button>
          <button type="submit" disabled={isLostFoundChange} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            {isLostFoundChange ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
