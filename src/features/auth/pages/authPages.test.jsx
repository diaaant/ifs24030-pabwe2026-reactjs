import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import { getAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { postLogin, postRegister } from "../api/authApi";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

vi.mock("../api/authApi", () => ({
  postLogin: vi.fn(),
  postRegister: vi.fn(),
  default: {},
}));

vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue({}),
}));

const routes = (
  <Routes>
    <Route path="/auth/login" element={<LoginPage />} />
    <Route path="/auth/register" element={<RegisterPage />} />
    <Route path="/" element={<p>Beranda</p>} />
  </Routes>
);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("login berhasil menyimpan token", async () => {
    postLogin.mockResolvedValue({ token: "tok-123" });
    renderWithProviders(routes, { route: "/auth/login" });
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    await waitFor(() => expect(getAccessToken()).toBe("tok-123"));
    expect(postLogin).toHaveBeenCalledWith({ email: "a@b.co", password: "123456" });
  });

  it("login gagal menampilkan dialog error dan tetap di halaman", async () => {
    postLogin.mockRejectedValue(new Error("Kredensial akun tidak ditemukan"));
    renderWithProviders(routes, { route: "/auth/login" });
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "salah123");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Kredensial akun tidak ditemukan"),
    );
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });

  it("memiliki tautan ke halaman daftar", async () => {
    renderWithProviders(routes, { route: "/auth/login" });
    await userEvent.click(screen.getByRole("link", { name: /daftar/i }));
    expect(await screen.findByRole("heading", { name: "Buat akun" })).toBeInTheDocument();
  });
});

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("register berhasil lalu menuju halaman login", async () => {
    postRegister.mockResolvedValue({});
    renderWithProviders(routes, { route: "/auth/register" });
    await userEvent.type(screen.getByLabelText("Nama lengkap"), "Dian");
    await userEvent.type(screen.getByLabelText("Email"), "d@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "123456");
    await userEvent.type(screen.getByLabelText("Ulangi kata sandi"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
    expect(await screen.findByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(postRegister).toHaveBeenCalledWith({
      name: "Dian",
      email: "d@b.co",
      password: "123456",
    });
    expect(showSuccessDialog).toHaveBeenCalled();
  });

  it("register gagal menampilkan error", async () => {
    postRegister.mockRejectedValue(new Error("Email sudah dipakai"));
    renderWithProviders(routes, { route: "/auth/register" });
    await userEvent.type(screen.getByLabelText("Nama lengkap"), "Dian");
    await userEvent.type(screen.getByLabelText("Email"), "d@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "123456");
    await userEvent.type(screen.getByLabelText("Ulangi kata sandi"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai"),
    );
  });

  it("memiliki tautan ke halaman masuk", async () => {
    renderWithProviders(routes, { route: "/auth/register" });
    await userEvent.click(screen.getByRole("link", { name: "Masuk" }));
    expect(await screen.findByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });
});