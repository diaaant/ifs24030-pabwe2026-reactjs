import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconSearch } from "@tabler/icons-react";
import Avatar from "../../../components/Avatar";
import { formatDate } from "../../../helpers/toolsHelper";
import { asyncGetUsers } from "../states/userThunks";

export default function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(asyncGetUsers());
  }, [dispatch]);

  const keyword = search.trim().toLowerCase();
  const visible = (users ?? []).filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(keyword),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Pengguna</h1>
          <p className="text-sm text-slate-500">
            Semua pengguna yang terdaftar.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <IconSearch
            size={18}
            className="absolute left-3 top-2.5 text-slate-600"
          />
          <input
            type="search"
            aria-label="Cari pengguna"
            placeholder="Cari nama atau email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-teal-600 focus:outline-none"
          />
        </div>
      </div>

      {users === null ? (
        <p className="text-slate-500">Memuat pengguna...</p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Pengguna tidak ditemukan.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <Avatar
                name={user.name}
                photo={user.photo}
                className="h-12 w-12"
                decorative
              />
              <div className="min-w-0">
                <p className="truncate font-bold">{user.name}</p>
                <p className="truncate text-sm text-slate-500">{user.email}</p>
                <p className="text-xs text-slate-600">
                  Bergabung {formatDate(user.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
