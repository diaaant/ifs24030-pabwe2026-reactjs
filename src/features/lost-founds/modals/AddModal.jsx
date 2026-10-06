import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ModalShell from "../../../components/ModalShell";
import ReportForm from "../components/ReportForm";
import { asyncAddLostFound } from "../states/action";
import { resetLostFoundFlagsAction } from "../states/lostFoundActions";

export default function AddModal({ onClose, onSaved }) {
  const dispatch = useDispatch();
  const busy = useSelector((state) => state.lostFounds.isLostFoundAdd);
  const added = useSelector((state) => state.lostFounds.isLostFoundAdded);

  useEffect(() => {
    if (!added) return;
    dispatch(resetLostFoundFlagsAction());
    onSaved?.();
    onClose();
  }, [added, dispatch, onSaved, onClose]);

  const save = (payload) => dispatch(asyncAddLostFound(payload));

  return (
    <ModalShell title="Buat laporan baru" subtitle="Ceritakan barang yang hilang atau kamu temukan." onClose={onClose}>
      <ReportForm busy={busy} submitLabel="Kirim laporan" onSubmit={save} />
    </ModalShell>
  );
}