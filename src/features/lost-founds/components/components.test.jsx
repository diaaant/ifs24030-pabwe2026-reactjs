import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import authApi from "../../auth/api/authApi";
import NavbarComponent from "./NavbarComponent";
import SidebarComponent from "./SidebarComponent";

vi.mock("../../auth/api/authApi", () => ({
  default: { login: vi.fn(), register: vi.fn(), logout: vi.fn() },
}));

const profile = { id: 1, name: "Dian", email: "dian@del.ac.id", photo: null };

describe("NavbarComponent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menampilkan nama pengguna dan memanggil onMenuClick", async () => {
    const onMenuClick = vi.fn();
    renderWithProviders(<NavbarComponent onMenuClick={onMenuClick} />, {
      preloadedState: { users: { profile } },
    });
    expect(screen.getByText("Dian", { selector: "span.hidden" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(onMenuClick).toHaveBeenCalled();
  });

  it("tetap tampil saat profil belum dimuat", () => {
    renderWithProviders(<NavbarComponent onMenuClick={() => {}} />);
    expect(screen.getByRole("button", { name: "Menu profil" })).toBeInTheDocument();
  });

  it("dropdown dapat dibuka, ditutup, dan menuju profil", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<NavbarComponent onMenuClick={() => {}} />} />
        <Route path="/profile" element={<p>Halaman profil</p>} />
      </Routes>,
      { preloadedState: { users: { profile } } },
    );
    const trigger = screen.getByRole("button", { name: "Menu profil" });
    await userEvent.click(trigger);
    expect(screen.getByText("dian@del.ac.id")).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(screen.queryByText("dian@del.ac.id")).not.toBeInTheDocument();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("link", { name: /Profil saya/ }));
    expect(screen.getByText("Halaman profil")).toBeInTheDocument();
  });

  it("logout menghapus token dan menuju halaman login", async () => {
    putAccessToken("tok");
    authApi.logout.mockResolvedValue({});
    renderWithProviders(
      <Routes>
        <Route path="/" element={<NavbarComponent onMenuClick={() => {}} />} />
        <Route path="/auth/login" element={<p>Halaman login</p>} />
      </Routes>,
      { preloadedState: { users: { profile } } },
    );
    await userEvent.click(screen.getByRole("button", { name: "Menu profil" }));
    await userEvent.click(screen.getByRole("button", { name: /Keluar/ }));
    expect(await screen.findByText("Halaman login")).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });
});

describe("SidebarComponent", () => {
  it("menampilkan seluruh menu navigasi", () => {
    render(
      <MemoryRouter>
        <SidebarComponent open={false} onClose={() => {}} />
      </MemoryRouter>,
    );
    ["Laporan", "Statistik", "Pengguna", "Profil Saya"].forEach((name) =>
      expect(screen.getByRole("link", { name })).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
    expect(screen.getByRole("complementary")).toHaveClass("-translate-x-full");
  });

  it("saat terbuka menampilkan overlay yang menutup sidebar", async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <SidebarComponent open onClose={onClose} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("complementary")).toHaveClass("translate-x-0");
    await userEvent.click(screen.getByTestId("sidebar-overlay"));
    await userEvent.click(screen.getByRole("button", { name: "Tutup menu" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("menandai menu aktif dan menutup sidebar saat menu diklik", async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter initialEntries={["/users"]}>
        <SidebarComponent open onClose={onClose} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveClass("bg-teal-50");
    expect(screen.getByRole("link", { name: "Laporan" })).not.toHaveClass("bg-teal-50");
    await userEvent.click(screen.getByRole("link", { name: "Statistik" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
