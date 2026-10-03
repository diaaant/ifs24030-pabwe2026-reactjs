import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ModalShell from "../../../components/ModalShell";
import useInput from "../../../hooks/useInput";
import { asyncAddLostFound } from "../states/lostFoundThunks";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

export default function AddModal({ onClose }) {
  const dispatch = useDispatch();
  const { isLostFoundAdd, isLostFoundAdded } = useSelector((state) => state.lostFounds);
  const [title, onTitleChange] = useInput("");
  const [description, onDescriptionChange] = useInput("");
  const [status, onStatusChange] = useInput("lost");

  useEffect(() => {
    if (isLostFoundAdded) onClose();
  }, [isLostFoundAdded, onClose]);

  const onSubmit = (event) => {
    event.preventDefault();
    dispatch(asyncAddLostFound({ title, description, status }));
  };

  return (
    <ModalShell title="Tambah laporan" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="add-title" className="mb-1.5 block text-sm font-semibold">Judul</label>
          <input id="add-title" required value={title} onChange={onTitleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="add-description" className="mb-1.5 block text-sm font-semibold">Deskripsi</label>
          <textarea id="add-description" required rows={4} value={description} onChange={onDescriptionChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="add-status" className="mb-1.5 block text-sm font-semibold">Jenis laporan</label>
          <select id="add-status" value={status} onChange={onStatusChange} className={inputClass}>
            <option value="lost">Barang hilang</option>
            <option value="found">Barang ditemukan</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100">
            Batal
          </button>
          <button type="submit" disabled={isLostFoundAdd} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            {isLostFoundAdd ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
