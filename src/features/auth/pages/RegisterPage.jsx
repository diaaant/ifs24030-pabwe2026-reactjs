import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useInput from "../../../hooks/useInput";
import { asyncRegister } from "../states/authThunks";
import { resetAuthAction } from "../states/authActions";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthRegister = useSelector((state) => state.auth.isAuthRegister);
  const [name, onNameChange] = useInput("");
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthRegister) {
      dispatch(resetAuthAction());
      navigate("/auth/login", { replace: true });
    }
  }, [isAuthRegister, dispatch, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    await dispatch(asyncRegister({ name, email, password }));
    setBusy(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Buat akun</h1>
      <p className="mt-1 text-sm text-slate-500">
        Daftar untuk mulai membuat laporan.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
            Nama lengkap
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={onNameChange}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={onEmailChange}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-semibold"
          >
            Kata sandi
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={onPasswordChange}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-teal-700 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {busy ? "Memproses..." : "Daftar"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link to="/auth/login" className="font-semibold text-teal-700">
          Masuk
        </Link>
      </p>
    </div>
  );
}
