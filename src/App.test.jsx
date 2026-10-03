import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./test-utils";
import { putAccessToken } from "./helpers/apiHelper";
import authApi from "./features/auth/api/authApi";
import userApi from "./features/users/api/userApi";
import lostFoundApi from "./features/lost-founds/api/lostFoundApi";
import App from "./App";

vi.mock("./features/auth/api/authApi", () => ({
  default: { login: vi.fn(), register: vi.fn(), logout: vi.fn() },
}));
vi.mock("./features/users/api/userApi", () => ({
  default: { getProfile: vi.fn(), getUsers: vi.fn() },
}));
vi.mock("./features/lost-founds/api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    getLostFound: vi.fn(),
    getStatsDaily: vi.fn(),
    getStatsMonthly: vi.fn(),
  },
}));
vi.mock("./helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const stats = {
  stats_losts: { "01-10-2026": 1 },
  stats_losts_completed: { "01-10-2026": 0 },
  stats_founds: { "01-10-2026": 0 },
  stats_founds_completed: { "01-10-2026": 0 },
};

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userApi.getProfile.mockResolvedValue({ id: 1, name: "Dian", email: "d@x.y", photo: null });
    userApi.getUsers.mockResolvedValue([
      { id: 1, name: "Dian", email: "d@x.y", photo: null, created_at: "2024-10-05T03:26:57.000000Z" },
    ]);
    lostFoundApi.getLostFounds.mockResolvedValue([
      {
        id: 3,
        user_id: 1,
        title: "Payung",
        description: "Payung biru",
        status: "lost",
        is_completed: 0,
        cover: null,
        created_at: "2024-02-28T07:49:32.000000Z",
        author: { name: "Dian", photo: null },
      },
    ]);
    lostFoundApi.getLostFound.mockResolvedValue({
      id: 3,
      user_id: 1,
      title: "Payung",
      description: "Payung biru",
      status: "lost",
      is_completed: 0,
      cover: null,
      created_at: "2024-02-28T07:49:32.000000Z",
      author: { name: "Dian", photo: null },
    });
    lostFoundApi.getStatsDaily.mockResolvedValue(stats);
    lostFoundApi.getStatsMonthly.mockResolvedValue(stats);
  });

  it("pengguna belum login diarahkan ke halaman login dari rute apa pun", async () => {
    renderWithProviders(<App />, { route: "/users" });
    expect(await screen.findByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("/auth diarahkan ke login dan register dapat dibuka", async () => {
    renderWithProviders(<App />, { route: "/auth" });
    expect(await screen.findByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Daftar" }));
    expect(screen.getByRole("heading", { name: "Buat akun" })).toBeInTheDocument();
  });

  it("alur login menuju dashboard, lalu logout kembali ke login", async () => {
    authApi.login.mockResolvedValue({ token: "tok" });
    authApi.logout.mockResolvedValue({});
    renderWithProviders(<App />, { route: "/auth/login" });
    await userEvent.type(screen.getByLabelText("Email"), "d@x.y");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(await screen.findByText("Payung")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Menu profil" }));
    await userEvent.click(screen.getByRole("button", { name: /Keluar/ }));
    expect(await screen.findByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("pengguna login melihat dashboard di /", async () => {
    putAccessToken("tok");
    renderWithProviders(<App />, { route: "/" });
    expect(await screen.findByText("Payung")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Laporan" })).toBeInTheDocument();
  });

  it("pengguna login diarahkan menjauh dari halaman login", async () => {
    putAccessToken("tok");
    renderWithProviders(<App />, { route: "/auth/login" });
    expect(await screen.findByText("Payung")).toBeInTheDocument();
  });

  it("rute detail, statistik, pengguna, dan profil dapat dibuka", async () => {
    putAccessToken("tok");
    const detail = renderWithProviders(<App />, { route: "/lost-founds/3" });
    expect(await screen.findByRole("heading", { name: "Payung" })).toBeInTheDocument();
    detail.unmount();

    const stat = renderWithProviders(<App />, { route: "/stats" });
    expect(await screen.findByRole("heading", { name: "Statistik" })).toBeInTheDocument();
    await screen.findByText("01-10-2026");
    stat.unmount();

    const users = renderWithProviders(<App />, { route: "/users" });
    expect(await screen.findByRole("heading", { name: "Pengguna" })).toBeInTheDocument();
    users.unmount();

    renderWithProviders(<App />, { route: "/profile" });
    expect(await screen.findByRole("heading", { name: "Profil saya" })).toBeInTheDocument();
  });

  it("rute tidak dikenal diarahkan ke beranda", async () => {
    putAccessToken("tok");
    renderWithProviders(<App />, { route: "/tidak-ada" });
    expect(await screen.findByText("Payung")).toBeInTheDocument();
  });
});
