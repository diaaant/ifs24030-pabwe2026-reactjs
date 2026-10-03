import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { IconPencil, IconPhoto, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import StatusBadge from "../../../components/StatusBadge";
import { assetUrl } from "../../../helpers/apiHelper";
import { formatDate } from "../../../helpers/toolsHelper";
import { asyncGetLostFounds, asyncDeleteLostFound } from "../states/lostFoundThunks";
import { resetLostFoundFlagsAction } from "../states/lostFoundActions";
import AddModal from "../modals/AddModal";
import ChangeModal from "../modals/ChangeModal";

const selectClass =
  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none";

export default function HomePage() {
  const dispatch = useDispatch();
  const { lostFounds, isLostFoundAdded, isLostFoundChanged, isLostFoundDeleted } =
    useSelector((state) => state.lostFounds);
  const profile = useSelector((state) => state.users.profile);

  const [status, setStatus] = useState("");
  const [completed, setCompleted] = useState("");
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const filters = useMemo(
    () => ({ status, is_completed: completed, is_me: mine ? 1 : undefined }),
    [status, completed, mine],
  );

  useEffect(() => {
    dispatch(asyncGetLostFounds(filters));
  }, [dispatch, filters]);

  const done = isLostFoundAdded || isLostFoundChanged || isLostFoundDeleted;
  useEffect(() => {
    if (done) {
      dispatch(resetLostFoundFlagsAction());
      dispatch(asyncGetLostFounds(filters));
    }
  }, [done, dispatch, filters]);

  const list = lostFounds ?? [];
  const keyword = search.trim().toLowerCase();
  const visible = list.filter((item) =>
    `${item.title} ${item.description} ${item.author.name}`.toLowerCase().includes(keyword),
  );

  const summary = [
    { label: "Total", value: list.length },
    { label: "Barang hilang", value: list.filter((i) => i.status === "lost").length },
    { label: "Barang ditemukan", value: list.filter((i) => i.status === "found").length },
    { label: "Selesai", value: list.filter((i) => i.is_completed).length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Laporan</h1>
          <p className="text-sm text-slate-500">Barang hilang dan barang temuan di kampus.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <IconPlus size={18} /> Tambah laporan
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-1 text-3xl font-extrabold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <IconSearch size={18} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="search"
            aria-label="Cari laporan"
            placeholder="Cari judul, deskripsi, atau pelapor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-teal-600 focus:outline-none"
          />
        </div>
        <select aria-label="Filter jenis" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="">Semua jenis</option>
          <option value="lost">Hilang</option>
          <option value="found">Ditemukan</option>
        </select>
        <select aria-label="Filter penyelesaian" value={completed} onChange={(e) => setCompleted(e.target.value)} className={selectClass}>
          <option value="">Semua status</option>
          <option value="0">Belum selesai</option>
          <option value="1">Selesai</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="h-4 w-4 accent-teal-700" />
          Laporan saya
        </label>
      </div>

      {lostFounds === null ? (
        <p className="text-slate-500">Memuat laporan...</p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Tidak ada laporan yang cocok.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => {
            const cover = assetUrl(item.cover);
            const isOwner = profile?.id === item.user_id;
            return (
              <article key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {cover ? (
                  <img src={cover} alt={item.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-400">
                    <IconPhoto size={36} />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <StatusBadge status={item.status} isCompleted={item.is_completed} />
                  <h2 className="font-bold leading-snug">{item.title}</h2>
                  <p className="line-clamp-2 text-sm text-slate-600">{item.description}</p>
                  <p className="mt-auto pt-2 text-xs text-slate-500">
                    {item.author.name} · {formatDate(item.created_at)}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Link to={`/lost-founds/${item.id}`} className="rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800 hover:bg-teal-100">
                      Detail
                    </Link>
                    {isOwner ? (
                      <>
                        <button type="button" aria-label={`Ubah ${item.title}`} onClick={() => setEditItem(item)} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100">
                          <IconPencil size={18} />
                        </button>
                        <button type="button" aria-label={`Hapus ${item.title}`} onClick={() => dispatch(asyncDeleteLostFound(item.id))} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50">
                          <IconTrash size={18} />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {addOpen ? <AddModal onClose={() => setAddOpen(false)} /> : null}
      {editItem ? <ChangeModal item={editItem} onClose={() => setEditItem(null)} /> : null}
    </div>
  );
}
