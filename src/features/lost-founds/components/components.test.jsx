import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders, stateWith } from "../../../test-utils";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import authApi from "../../auth/api/authApi";
import NavbarComponent from "./NavbarComponent";
import SidebarComponent from "./SidebarComponent";

vi.mock("../../auth/api/authApi", () => ({
  default: { login: vi.fn(), register: vi.fn(), logout: vi.fn() },
}));

const profile = { id: 1, name: "Dian", email: "dian@del.ac.id", photo: null };
const withProfile = () => ({ preloadedState: stateWith({ users: { profile } }) });

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("menampilkan nama pengguna dan memanggil onOpenMenu", async () => {
    const onOpenMenu = vi.fn();
    renderWithProviders(<NavbarComponent onOpenMenu={onOpenMenu} />, withProfile());
    expect(screen.getByText("Dian", { selector: "span.hidden" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(onOpenMenu).toHaveBeenCalled();
  });

  it("tidak menampilkan apa pun saat profil belum dimuat (sesi berakhir)", () => {
    renderWithProviders(<NavbarComponent onOpenMenu={() => {}} />);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Menu profil" })).not.toBeInTheDocument();
  });

  it("dropdown dapat dibuka, ditutup, dan menuju profil", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<NavbarComponent onOpenMenu={() => {}} />} />
        <Route path="/profile" element={<p>Halaman profil</p>} />
      </Routes>,
      withProfile(),
    );
    const trigger = screen.getByRole("button", { name: "Menu profil" });
    await userEvent.click(trigger);
    expect(screen.getByText("dian@del.ac.id")).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(screen.queryByText("dian@del.ac.id")).not.toBeInTheDocument();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("menuitem", { name: /Profil saya/ }));
    expect(screen.getByText("Halaman profil")).toBeInTheDocument();
  });

  it("logout menghapus token dan menuju halaman login", async () => {
    putAccessToken("tok");
    authApi.logout.mockResolvedValue({});
    renderWithProviders(
      <Routes>
        <Route path="/" element={<NavbarComponent onOpenMenu={() => {}} />} />
        <Route path="/auth/login" element={<p>Halaman login</p>} />
      </Routes>,
      withProfile(),
    );
    await userEvent.click(screen.getByRole("button", { name: "Menu profil" }));
    await userEvent.click(screen.getByRole("menuitem", { name: /Keluar/ }));
    expect(await screen.findByText("Halaman login")).toBeInTheDocument();
    await waitFor(() => expect(getAccessToken()).toBeNull());
  });
});

describe("SidebarComponent", () => {
  it("menampilkan seluruh menu navigasi", () => {
    renderWithProviders(<SidebarComponent open={false} onClose={() => {}} />);
    ["Laporan", "Statistik", "Pengguna", "Profil Saya"].forEach((name) =>
      expect(screen.getByRole("link", { name })).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
    expect(screen.getByRole("complementary")).toHaveClass("-translate-x-full");
  });

  it("saat terbuka menampilkan overlay yang menutup sidebar", async () => {
    const onClose = vi.fn();
    renderWithProviders(<SidebarComponent open onClose={onClose} />);
    expect(screen.getByRole("complementary")).toHaveClass("translate-x-0");
    await userEvent.click(screen.getByTestId("sidebar-overlay"));
    await userEvent.click(screen.getByRole("button", { name: "Tutup menu" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("menandai menu aktif dan menutup sidebar saat menu diklik", async () => {
    const onClose = vi.fn();
    renderWithProviders(<SidebarComponent open onClose={onClose} />, { route: "/users" });
    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Laporan" })).not.toHaveAttribute("aria-current");
    await userEvent.click(screen.getByRole("link", { name: "Statistik" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});