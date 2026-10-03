import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ModalShell from "../../../components/ModalShell";
import { assetUrl } from "../../../helpers/apiHelper";
import { asyncChangeCover } from "../states/lostFoundThunks";

export default function ChangeCoverModal({ item, onClose }) {
  const dispatch = useDispatch();
  const { isLostFoundChangeCover, isLostFoundChangedCover } = useSelector(
    (state) => state.lostFounds,
  );
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(assetUrl(item.cover));
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLostFoundChangedCover) onClose();
  }, [isLostFoundChangedCover, onClose]);

  const onFileChange = (event) => {
    const selected = event.target.files[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, dll).");
      setFile(null);
      return;
    }
    setError("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    dispatch(asyncChangeCover(item.id, file));
  };

  return (
    <ModalShell title="Ubah cover" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        {preview ? (
          <img src={preview} alt="Pratinjau cover" className="h-48 w-full rounded-xl object-cover" />
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
            Belum ada cover
          </div>
        )}
        <div>
          <label htmlFor="cover-file" className="mb-1.5 block text-sm font-semibold">Pilih gambar</label>
          <input id="cover-file" type="file" accept="image/*" onChange={onFileChange} className="w-full text-sm" />
          {error ? <p role="alert" className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100">
            Batal
          </button>
          <button type="submit" disabled={!file || isLostFoundChangeCover} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            {isLostFoundChangeCover ? "Mengunggah..." : "Unggah"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
