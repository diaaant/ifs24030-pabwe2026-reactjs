import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { IconLock, IconMail } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { asyncLogin } from "../states/authThunks";
import { resetAuthAction } from "../states/authActions";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthLogin = useSelector((state) => state.auth.isAuthLogin);
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthLogin) {
      dispatch(resetAuthAction());
      navigate("/", { replace: true });
    }
  }, [isAuthLogin, dispatch, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    await dispatch(asyncLogin({ email, password }));
    setBusy(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-extrabold">Masuk</h2>
      <p className="mt-1 text-sm text-slate-500">
        Gunakan akun Delcom Open API kamu.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
            Email
          </label>
          <div className="relative">
            <IconMail size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={onEmailChange}
              placeholder="nama@email.com"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
            Kata sandi
          </label>
          <div className="relative">
            <IconLock size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={onPasswordChange}
              placeholder="Kata sandi"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-teal-700 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {busy ? "Memproses..." : "Masuk"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link to="/auth/register" className="font-semibold text-teal-700">
          Daftar
        </Link>
      </p>
    </div>
  );
}
