import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../../../helpers/apiHelper";
import { asyncGetProfile } from "../../users/states/userThunks";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

export default function LostFoundLayout() {
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isProfile, profile } = useSelector((state) => state.users);
  const token = getAccessToken();

  useEffect(() => {
    if (token) dispatch(asyncGetProfile());
  }, [token, dispatch]);

  // Belum login, atau profil gagal dimuat (token tidak valid)
  if (!token || (isProfile && !profile)) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarComponent onMenuClick={() => setSidebarOpen(true)} />
      <SidebarComponent open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="p-4 lg:ml-64 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
