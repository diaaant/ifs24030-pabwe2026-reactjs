import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import {
  setIsLostFoundChangedAction,
  setIsLostFoundChangedCoverAction,
} from "../states/lostFoundActions";
import DetailPage from "./DetailPage";

vi.mock("../api/lostFoundApi", () => ({
  default: { getLostFound: vi.fn(), deleteLostFound: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const base = {
  id: 5,
  user_id: 1,
  title: "Dompet hitam",
  description: "Hilang di kantin",
  status: "lost",
  is_completed: 0,
  cover: "img/lost-founds/cover/5.png",
  created_at: "2024-02-28T07:49:32.000000Z",
  author: { name: "Dian", photo: null },
};
const owner = { users: { profile: { id: 1, name: "Dian" } } };

const ui = (
  <Routes>
    <Route path="/lost-founds/:id" element={<DetailPage />} />
    <Route path="/" element={<p>Beranda</p>} />
  </Routes>
);
const open = (preloadedState) =>
  renderWithProviders(ui, { route: "/lost-founds/5", preloadedState });

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lostFoundApi.getLostFound.mockResolvedValue(base);
  });

  it("menampilkan loading lalu detail lengkap", async () => {
    open(owner);
    expect(screen.getByText("Memuat detail laporan...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Dompet hitam" })).toBeInTheDocument();
    expect(screen.getByText("Hilang di kantin")).toBeInTheDocument();
    expect(screen.getByText("Hilang")).toBeInTheDocument();
    expect(screen.getByAltText("Dompet hitam")).toBeInTheDocument();
    expect(screen.getByText(/Dilaporkan/)).toBeInTheDocument();
    expect(lostFoundApi.getLostFound).toHaveBeenCalledWith("5");
  });

  it("tanpa cover menampilkan placeholder", async () => {
    lostFoundApi.getLostFound.mockResolvedValue({ ...base, cover: null });
    open(owner);
    await screen.findByRole("heading", { name: "Dompet hitam" });
    expect(screen.queryByAltText("Dompet hitam")).not.toBeInTheDocument();
  });

  it("pengguna lain tidak melihat tombol aksi", async () => {
    open({ users: { profile: { id: 99, name: "Lain" } } });
    await screen.findByRole("heading", { name: "Dompet hitam" });
    expect(screen.queryByRole("button", { name: /Edit/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Hapus/ })).not.toBeInTheDocument();
  });

  it("tanpa profil tidak ada tombol aksi", async () => {
    open();
    await screen.findByRole("heading", { name: "Dompet hitam" });
    expect(screen.queryByRole("button", { name: /Edit/ })).not.toBeInTheDocument();
  });

  it("menampilkan pesan jika laporan tidak ditemukan", async () => {
    lostFoundApi.getLostFound.mockRejectedValue(new Error("404"));
    open(owner);
    expect(await screen.findByText("Laporan tidak ditemukan.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: /Kembali ke laporan/ }));
    expect(screen.getByText("Beranda")).toBeInTheDocument();
  });

  it("modal edit dan edit cover dapat dibuka dan ditutup", async () => {
    open(owner);
    await screen.findByRole("heading", { name: "Dompet hitam" });
    await userEvent.click(screen.getByRole("button", { name: /^Edit$/ }));
    expect(screen.getByRole("dialog", { name: "Ubah laporan" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Edit cover/ }));
    expect(screen.getByRole("dialog", { name: "Ubah cover" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each([
    ["diubah", setIsLostFoundChangedAction],
    ["diganti covernya", setIsLostFoundChangedCoverAction],
  ])("memuat ulang detail setelah laporan %s", async (_label, action) => {
    const { store } = open(owner);
    await screen.findByRole("heading", { name: "Dompet hitam" });
    act(() => { store.dispatch(action(true)); });
    await waitFor(() => expect(lostFoundApi.getLostFound).toHaveBeenCalledTimes(2));
  });

  it("hapus yang dikonfirmasi kembali ke beranda", async () => {
    showConfirmDialog.mockResolvedValue(true);
    lostFoundApi.deleteLostFound.mockResolvedValue({});
    open(owner);
    await screen.findByRole("heading", { name: "Dompet hitam" });
    await userEvent.click(screen.getByRole("button", { name: /Hapus/ }));
    expect(await screen.findByText("Beranda")).toBeInTheDocument();
    expect(lostFoundApi.deleteLostFound).toHaveBeenCalledWith(5);
  });

  it("hapus yang dibatalkan tetap di halaman", async () => {
    showConfirmDialog.mockResolvedValue(false);
    open(owner);
    await screen.findByRole("heading", { name: "Dompet hitam" });
    await userEvent.click(screen.getByRole("button", { name: /Hapus/ }));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(lostFoundApi.deleteLostFound).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Dompet hitam" })).toBeInTheDocument();
  });
});
