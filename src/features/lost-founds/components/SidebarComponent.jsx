import { NavLink } from "react-router-dom";
import {
  IconChartBar,
  IconLayoutDashboard,
  IconUserCircle,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

const MENUS = [
  { to: "/", label: "Laporan", icon: IconLayoutDashboard, end: true },
  { to: "/stats", label: "Statistik", icon: IconChartBar, end: false },
  { to: "/users", label: "Pengguna", icon: IconUsers, end: false },
  { to: "/profile", label: "Profil Saya", icon: IconUserCircle, end: false },
];

export default function SidebarComponent({ open, onClose }) {
  return (
    <>
      {open ? (
        <div
          data-testid="sidebar-overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      ) : null}
      <aside
        aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white p-4 transition-transform lg:top-16 lg:z-20 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="font-extrabold text-teal-800">Menu</span>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-slate-100"
          >
            <IconX size={20} />
          </button>
        </div>
        <nav className="space-y-1">
          {MENUS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={20} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
