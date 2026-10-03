import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../../../components/Avatar";
import useInput from "../../../hooks/useInput";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import {
  asyncChangeProfile,
  asyncChangeProfilePassword,
  asyncChangeProfilePhoto,
} from "../states/userThunks";
import { resetUserFlagsAction } from "../states/userActions";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";
const buttonClass =
  "rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { profile, isChangeProfilePhoto, isChangeProfilePassword } = useSelector(
    (state) => state.users,
  );

  const [name, onNameChange, setName] = useInput("");
  const [email, onEmailChange, setEmail] = useInput("");
  const [photo, setPhoto] = useState(null);
  const [password, onPasswordChange, setPassword] = useInput("");
  const [newPassword, onNewPasswordChange, setNewPassword] = useInput("");
  const [confirmation, onConfirmationChange, setConfirmation] = useInput("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile, setName, setEmail]);

  useEffect(() => {
    if (isChangeProfilePhoto || isChangeProfilePassword) {
      if (isChangeProfilePassword) {
        setPassword("");
        setNewPassword("");
        setConfirmation("");
      }
      setPhoto(null);
      dispatch(resetUserFlagsAction());
    }
  }, [isChangeProfilePhoto, isChangeProfilePassword, dispatch, setPassword, setNewPassword, setConfirmation]);

  const onProfileSubmit = (event) => {
    event.preventDefault();
    dispatch(asyncChangeProfile({ name, email }));
  };

  const onPhotoSubmit = (event) => {
    event.preventDefault();
    dispatch(asyncChangeProfilePhoto(photo));
  };

  const onPasswordSubmit = (event) => {
    event.preventDefault();
    if (newPassword !== confirmation) {
      showErrorDialog("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    dispatch(
      asyncChangeProfilePassword({
        password,
        new_password: newPassword,
        new_password_confirmation: confirmation,
      }),
    );
  };

  if (!profile) return <p className="text-slate-500">Memuat profil...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold">Profil saya</h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-bold">Foto profil</h2>
        <form onSubmit={onPhotoSubmit} className="flex flex-wrap items-center gap-4">
          <Avatar name={profile.name} photo={profile.photo} className="h-16 w-16" />
          <input
            aria-label="Pilih foto"
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0] ?? null)}
            className="text-sm"
          />
          <button type="submit" disabled={!photo} className={buttonClass}>
            Unggah foto
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-bold">Data akun</h2>
        <form onSubmit={onProfileSubmit} className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-sm font-semibold">Nama</label>
            <input id="profile-name" required value={name} onChange={onNameChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-sm font-semibold">Email</label>
            <input id="profile-email" type="email" required value={email} onChange={onEmailChange} className={inputClass} />
          </div>
          <button type="submit" className={buttonClass}>Simpan perubahan</button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-bold">Ganti kata sandi</h2>
        <form onSubmit={onPasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="mb-1.5 block text-sm font-semibold">Kata sandi saat ini</label>
            <input id="current-password" type="password" required value={password} onChange={onPasswordChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-semibold">Kata sandi baru</label>
            <input id="new-password" type="password" required value={newPassword} onChange={onNewPasswordChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-semibold">Konfirmasi kata sandi baru</label>
            <input id="confirm-password" type="password" required value={confirmation} onChange={onConfirmationChange} className={inputClass} />
          </div>
          <button type="submit" className={buttonClass}>Ubah kata sandi</button>
        </form>
      </section>
    </div>
  );
}
