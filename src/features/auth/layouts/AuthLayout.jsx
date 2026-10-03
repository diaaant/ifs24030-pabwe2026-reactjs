import { Navigate, Outlet } from "react-router-dom";
import { IconSearch } from "@tabler/icons-react";
import { getAccessToken } from "../../../helpers/apiHelper";

export default function AuthLayout() {
  if (getAccessToken()) return <Navigate to="/" replace />;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-teal-800 p-12 text-teal-50 lg:flex">
        <div className="flex items-center gap-3 text-lg font-bold">
          <img src="/logo.svg" alt="" className="h-10 w-10" />
          Lost &amp; Found Kampus
        </div>
        <div>
          <IconSearch size={40} className="mb-6 text-amber-300" />
          <h1 className="max-w-md text-4xl font-extrabold leading-tight">
            Barang hilang di kampus? Kabari semua orang.
          </h1>
          <p className="mt-4 max-w-md text-teal-100">
            Laporkan barang yang hilang atau yang kamu temukan, lalu pantau
            sampai barangnya kembali ke pemiliknya.
          </p>
        </div>
        <p className="text-sm text-teal-200">Praktikum 4 PABWE 2026</p>
      </aside>
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
