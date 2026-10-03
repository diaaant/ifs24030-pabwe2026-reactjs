import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import { getAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import authApi from "../api/authApi";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

vi.mock("../api/authApi", () => ({
  default: { login: vi.fn(), register: vi.fn(), logout: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const routes = (
  <Routes>
    <Route path="/auth/login" element={<LoginPage />} />
    <Route path="/auth/register" element={<RegisterPage />} />
    <Route path="/" element={<p>Beranda</p>} />
  </Routes>
);

describe("LoginPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("login berhasil menyimpan token lalu menuju beranda", async () => {
    authApi.login.mockResolvedValue({ token: "tok-123" });
    renderWithProviders(routes, { route: "/auth/login" });
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(await screen.findByText("Beranda")).toBeInTheDocument();
    expect(getAccessToken()).toBe("tok-123");
    expect(authApi.login).toHaveBeenCalledWith({ email: "a@b.co", password: "123456" });
  });

  it("login gagal menampilkan dialog error dan tetap di halaman", async () => {
    authApi.login.mockRejectedValue(new Error("Kredensial akun tidak ditemukan"));
    renderWithProviders(routes, { route: "/auth/login" });
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "salah");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Kredensial akun tidak ditemukan"),
    );
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });

  it("memiliki tautan ke halaman daftar", async () => {
    renderWithProviders(routes, { route: "/auth/login" });
    await userEvent.click(screen.getByRole("link", { name: "Daftar" }));
    expect(screen.getByRole("heading", { name: "Buat akun" })).toBeInTheDocument();
  });
});

describe("RegisterPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("register berhasil lalu menuju halaman login", async () => {
    authApi.register.mockResolvedValue({});
    renderWithProviders(routes, { route: "/auth/register" });
    await userEvent.type(screen.getByLabelText("Nama lengkap"), "Dian");
    await userEvent.type(screen.getByLabelText("Email"), "d@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
    expect(await screen.findByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(authApi.register).toHaveBeenCalledWith({ name: "Dian", email: "d@b.co", password: "123456" });
    expect(showSuccessDialog).toHaveBeenCalled();
  });

  it("register gagal menampilkan error", async () => {
    authApi.register.mockRejectedValue(new Error("Email sudah dipakai"));
    renderWithProviders(routes, { route: "/auth/register" });
    await userEvent.type(screen.getByLabelText("Nama lengkap"), "Dian");
    await userEvent.type(screen.getByLabelText("Email"), "d@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai"));
  });

  it("memiliki tautan ke halaman masuk", async () => {
    renderWithProviders(routes, { route: "/auth/register" });
    await userEvent.click(screen.getByRole("link", { name: "Masuk" }));
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });
});
