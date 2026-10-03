import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IconArrowLeft, IconPencil, IconPhoto, IconTrash } from "@tabler/icons-react";
import Avatar from "../../../components/Avatar";
import StatusBadge from "../../../components/StatusBadge";
import { assetUrl } from "../../../helpers/apiHelper";
import { formatDate } from "../../../helpers/toolsHelper";
import { asyncDeleteLostFound, asyncGetLostFound } from "../states/lostFoundThunks";
import { clearLostFoundAction, resetLostFoundFlagsAction } from "../states/lostFoundActions";
import ChangeModal from "../modals/ChangeModal";
import ChangeCoverModal from "../modals/ChangeCoverModal";

export default function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lostFound, isLostFound, isLostFoundChanged, isLostFoundChangedCover, isLostFoundDeleted } =
    useSelector((state) => state.lostFounds);
  const profile = useSelector((state) => state.users.profile);
  const [editOpen, setEditOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);

  useEffect(() => {
    dispatch(clearLostFoundAction());
    dispatch(asyncGetLostFound(id));
  }, [id, dispatch]);

  const refresh = isLostFoundChanged || isLostFoundChangedCover;
  useEffect(() => {
    if (refresh) {
      dispatch(resetLostFoundFlagsAction());
      dispatch(asyncGetLostFound(id));
    }
  }, [refresh, id, dispatch]);

  useEffect(() => {
    if (isLostFoundDeleted) {
      dispatch(resetLostFoundFlagsAction());
      navigate("/", { replace: true });
    }
  }, [isLostFoundDeleted, dispatch, navigate]);

  const back = (
    <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
      <IconArrowLeft size={16} /> Kembali ke laporan
    </Link>
  );

  if (!isLostFound) return <p className="text-slate-500">Memuat detail laporan...</p>;

  if (!lostFound) {
    return (
      <div className="space-y-4">
        {back}
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Laporan tidak ditemukan.
        </p>
      </div>
    );
  }

  const cover = assetUrl(lostFound.cover);
  const isOwner = profile?.id === lostFound.user_id;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {back}
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {cover ? (
          <img src={cover} alt={lostFound.title} className="h-72 w-full object-cover" />
        ) : (
          <div className="flex h-72 items-center justify-center bg-slate-100 text-slate-400">
            <IconPhoto size={48} />
          </div>
        )}
        <div className="space-y-4 p-6">
          <StatusBadge status={lostFound.status} isCompleted={lostFound.is_completed} />
          <h1 className="text-2xl font-extrabold">{lostFound.title}</h1>
          <p className="whitespace-pre-line text-slate-700">{lostFound.description}</p>
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <Avatar name={lostFound.author.name} photo={lostFound.author.photo} />
            <div className="text-sm">
              <p className="font-semibold">{lostFound.author.name}</p>
              <p className="text-slate-500">Dilaporkan {formatDate(lostFound.created_at)}</p>
            </div>
          </div>
          {isOwner ? (
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" onClick={() => setEditOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                <IconPencil size={16} /> Edit
              </button>
              <button type="button" onClick={() => setCoverOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                <IconPhoto size={16} /> Edit cover
              </button>
              <button type="button" onClick={() => dispatch(asyncDeleteLostFound(lostFound.id))} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                <IconTrash size={16} /> Hapus
              </button>
            </div>
          ) : null}
        </div>
      </article>
      {editOpen ? <ChangeModal item={lostFound} onClose={() => setEditOpen(false)} /> : null}
      {coverOpen ? <ChangeCoverModal item={lostFound} onClose={() => setCoverOpen(false)} /> : null}
    </div>
  );
}
