import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../api/userApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import {
  setIsChangeProfilePasswordAction,
  setIsChangeProfilePhotoAction,
} from "../states/userActions";
import ProfilePage from "./ProfilePage";

vi.mock("../api/userApi", () => ({
  default: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    updatePhoto: vi.fn(),
    updatePassword: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const profile = { id: 1, name: "Dian", email: "dian@del.ac.id", photo: null };
const open = () => renderWithProviders(<ProfilePage />, { preloadedState: { users: { profile, isProfile: true } } });

describe("ProfilePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menampilkan loading jika profil belum ada", () => {
    renderWithProviders(<ProfilePage />);
    expect(screen.getByText("Memuat profil...")).toBeInTheDocument();
  });

  it("form terisi data profil", () => {
    open();
    expect(screen.getByLabelText("Nama")).toHaveValue("Dian");
    expect(screen.getByLabelText("Email")).toHaveValue("dian@del.ac.id");
  });

  it("mengubah profil", async () => {
    userApi.updateProfile.mockResolvedValue({ ...profile, name: "Dian R" });
    open();
    await userEvent.clear(screen.getByLabelText("Nama"));
    await userEvent.type(screen.getByLabelText("Nama"), "Dian R");
    await userEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() =>
      expect(userApi.updateProfile).toHaveBeenCalledWith({ name: "Dian R", email: "dian@del.ac.id" }),
    );
    await waitFor(() => expect(screen.getByLabelText("Nama")).toHaveValue("Dian R"));
  });

  it("mengunggah foto profil", async () => {
    userApi.updatePhoto.mockResolvedValue({});
    userApi.getProfile.mockResolvedValue(profile);
    open();
    const button = screen.getByRole("button", { name: "Unggah foto" });
    expect(button).toBeDisabled();
    const file = new File(["x"], "me.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Pilih foto"), { target: { files: [file] } });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    await waitFor(() => expect(userApi.updatePhoto).toHaveBeenCalledWith(file));
    await waitFor(() => expect(button).toBeDisabled()); // file direset setelah sukses
  });

  it("pemilihan foto yang dibatalkan mengosongkan pilihan", () => {
    open();
    const input = screen.getByLabelText("Pilih foto");
    fireEvent.change(input, { target: { files: [new File(["x"], "a.png", { type: "image/png" })] } });
    expect(screen.getByRole("button", { name: "Unggah foto" })).toBeEnabled();
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.getByRole("button", { name: "Unggah foto" })).toBeDisabled();
  });

  it("mengganti kata sandi lalu mengosongkan form", async () => {
    userApi.updatePassword.mockResolvedValue({});
    open();
    await userEvent.type(screen.getByLabelText("Kata sandi saat ini"), "lama123");
    await userEvent.type(screen.getByLabelText("Kata sandi baru"), "baru123");
    await userEvent.type(screen.getByLabelText("Konfirmasi kata sandi baru"), "baru123");
    await userEvent.click(screen.getByRole("button", { name: "Ubah kata sandi" }));
    await waitFor(() =>
      expect(userApi.updatePassword).toHaveBeenCalledWith({
        password: "lama123",
        new_password: "baru123",
        new_password_confirmation: "baru123",
      }),
    );
    await waitFor(() => expect(screen.getByLabelText("Kata sandi baru")).toHaveValue(""));
    expect(screen.getByLabelText("Kata sandi saat ini")).toHaveValue("");
  });

  it("menolak konfirmasi kata sandi yang tidak cocok", async () => {
    open();
    await userEvent.type(screen.getByLabelText("Kata sandi saat ini"), "lama123");
    await userEvent.type(screen.getByLabelText("Kata sandi baru"), "baru123");
    await userEvent.type(screen.getByLabelText("Konfirmasi kata sandi baru"), "beda123");
    await userEvent.click(screen.getByRole("button", { name: "Ubah kata sandi" }));
    expect(showErrorDialog).toHaveBeenCalledWith("Konfirmasi kata sandi baru tidak cocok.");
    expect(userApi.updatePassword).not.toHaveBeenCalled();
  });

  it("flag sukses direset oleh halaman", async () => {
    const { store } = open();
    act(() => {
      store.dispatch(setIsChangeProfilePhotoAction(true));
    });
    await waitFor(() => expect(store.getState().users.isChangeProfilePhoto).toBe(false));
    act(() => {
      store.dispatch(setIsChangeProfilePasswordAction(true));
    });
    await waitFor(() => expect(store.getState().users.isChangeProfilePassword).toBe(false));
  });
});
