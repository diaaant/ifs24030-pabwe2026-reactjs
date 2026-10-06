import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ModalShell from "../../../components/ModalShell";
import ReportForm from "../components/ReportForm";
import { isDone } from "../../../helpers/toolsHelper";
import { asyncChangeLostFound } from "../states/action";
import { resetLostFoundFlagsAction } from "../states/lostFoundActions";

export default function ChangeModal({ item, onClose, onSaved }) {
  const dispatch = useDispatch();
  const busy = useSelector((state) => state.lostFounds.isLostFoundChange);
  const changed = useSelector((state) => state.lostFounds.isLostFoundChanged);

  // Tutup modal ketika proses ubah berhasil (flag menyala)
  useEffect(() => {
    if (!changed) return;
    dispatch(resetLostFoundFlagsAction());
    onSaved?.();
    onClose();
  }, [changed, dispatch, onSaved, onClose]);

  const save = (payload) => dispatch(asyncChangeLostFound(item.id, payload));

  return (
    <ModalShell title="Ubah laporan" subtitle="Perbarui keterangan atau status penyelesaian." onClose={onClose}>
      <ReportForm
        initial={{ title: item.title, description: item.description, status: item.status, completed: isDone(item) }}
        withCompleted
        busy={busy}
        submitLabel="Simpan perubahan"
        onSubmit={save}
      />
    </ModalShell>
  );
}