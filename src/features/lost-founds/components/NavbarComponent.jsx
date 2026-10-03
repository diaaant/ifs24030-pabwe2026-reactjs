import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  IconChevronDown,
  IconLogout,
  IconMenu2,
  IconUserCircle,
} from "@tabler/icons-react";
import Avatar from "../../../components/Avatar";
import { asyncLogout } from "../../auth/states/authThunks";
import { resetAuthAction } from "../../auth/states/authActions";

export default function NavbarComponent({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector((state) => state.users.profile);
  const isAuthLogout = useSelector((state) => state.auth.isAuthLogout);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isAuthLogout) {
      dispatch(resetAuthAction());
      navigate("/auth/login", { replace: true });
    }
  }, [isAuthLogout, dispatch, navigate]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Buka menu"
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
        >
          <IconMenu2 size={22} />
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 font-extrabold text-teal-800"
        >
          <img src="/logo.svg" alt="" className="h-8 w-8" />
          <span className="hidden sm:inline">Lost &amp; Found Kampus</span>
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Menu profil"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100"
        >
          <Avatar name={profile?.name} photo={profile?.photo} decorative />
          <span className="hidden text-sm font-semibold sm:inline">
            {profile?.name}
          </span>
          <IconChevronDown size={16} />
        </button>
        {open ? (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <p className="truncate px-3 py-2 text-xs text-slate-500">
              {profile?.email}
            </p>
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              <IconUserCircle size={18} /> Profil saya
            </Link>
            <button
              type="button"
              onClick={() => dispatch(asyncLogout())}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <IconLogout size={18} /> Keluar
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
