import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import {
  setIsLostFoundAddedAction,
  setIsLostFoundChangedAction,
  setIsLostFoundDeletedAction,
} from "../states/lostFoundActions";
import HomePage from "./HomePage";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    addLostFound: vi.fn(),
    changeLostFound: vi.fn(),
    deleteLostFound: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const items = [
  {
    id: 1,
    user_id: 1,
    title: "Dompet hitam",
    description: "Hilang di kantin",
    status: "lost",
    is_completed: 0,
    cover: "img/lost-founds/cover/1.png",
    created_at: "2024-02-28T07:49:32.000000Z",
    author: { name: "Dian", photo: null },
  },
  {
    id: 2,
    user_id: 2,
    title: "Kunci motor",
    description: "Ditemukan di parkiran",
    status: "found",
    is_completed: 1,
    cover: null,
    created_at: "2024-03-01T07:49:32.000000Z",
    author: { name: "Rafael", photo: null },
  },
];

const profileState = { users: { profile: { id: 1, name: "Dian" } } };

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lostFoundApi.getLostFounds.mockResolvedValue(items);
  });

  it("menampilkan loading lalu daftar dan ringkasan", async () => {
    renderWithProviders(<HomePage />, { preloadedState: profileState });
    expect(screen.getByText("Memuat laporan...")).toBeInTheDocument();
    expect(await screen.findByText("Dompet hitam")).toBeInTheDocument();
    expect(screen.getByText("Kunci motor")).toBeInTheDocument();
    const total = screen.getByText("Total").parentElement;
    expect(within(total).getByText("2")).toBeInTheDocument();
    expect(lostFoundApi.getLostFounds).toHaveBeenCalledWith({
      status: "",
      is_completed: "",
      is_me: undefined,
    });
  });

  it("hanya pemilik laporan yang melihat tombol ubah dan hapus", async () => {
    renderWithProviders(<HomePage />, { preloadedState: profileState });
    await screen.findByText("Dompet hitam");
    expect(screen.getByRole("button", { name: "Ubah Dompet hitam" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ubah Kunci motor" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Detail" })[0]).toHaveAttribute("href", "/lost-founds/1");
  });

  it("tanpa profil tidak ada tombol ubah/hapus", async () => {
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet hitam");
    expect(screen.queryByRole("button", { name: /Ubah/ })).not.toBeInTheDocument();
  });

  it("live search menyaring daftar dan menampilkan keadaan kosong", async () => {
    renderWithProviders(<HomePage />, { preloadedState: profileState });
    await screen.findByText("Dompet hitam");
    await userEvent.type(screen.getByLabelText("Cari laporan"), "kunci");
    expect(screen.queryByText("Dompet hitam")).not.toBeInTheDocument();
    expect(screen.getByText("Kunci motor")).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("Cari laporan"));
    await userEvent.type(screen.getByLabelText("Cari laporan"), "tidak-ada");
    expect(screen.getByText("Tidak ada laporan yang cocok.")).toBeInTheDocument();
  });

  it("filter dikirim sebagai query ke API", async () => {
    renderWithProviders(<HomePage />, { preloadedState: profileState });
    await screen.findByText("Dompet hitam");
    await userEvent.selectOptions(screen.getByLabelText("Filter jenis"), "lost");
    await waitFor(() =>
      expect(lostFoundApi.getLostFounds).toHaveBeenLastCalledWith({
        status: "lost",
        is_completed: "",
        is_me: undefined,
      }),
    );
    await userEvent.selectOptions(screen.getByLabelText("Filter penyelesaian"), "1");
    await waitFor(() =>
      expect(lostFoundApi.getLostFounds).toHaveBeenLastCalledWith({
        status: "lost",
        is_completed: "1",
        is_me: undefined,
      }),
    );
    await userEvent.click(screen.getByLabelText("Laporan saya"));
    await waitFor(() =>
      expect(lostFoundApi.getLostFounds).toHaveBeenLastCalledWith({
        status: "lost",
        is_completed: "1",
        is_me: 1,
      }),
    );
  });

  it("tombol tambah membuka modal dan batal menutupnya", async () => {
    renderWithProviders(<HomePage />, { preloadedState: profileState });
    await screen.findByText("Dompet hitam");
    await userEvent.click(screen.getByRole("button", { name: /Tambah laporan/ }));
    expect(screen.getByRole("dialog", { name: "Tambah laporan" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("tombol ubah membuka modal ubah dan batal menutupnya", async () => {
    renderWithProviders(<HomePage />, { preloadedState: profileState });
    await screen.findByText("Dompet hitam");
    await userEvent.click(screen.getByRole("button", { name: "Ubah Dompet hitam" }));
    expect(screen.getByRole("dialog", { name: "Ubah laporan" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hapus meminta konfirmasi lalu memuat ulang daftar", async () => {
    showConfirmDialog.mockResolvedValue(true);
    lostFoundApi.deleteLostFound.mockResolvedValue({});
    renderWithProviders(<HomePage />, { preloadedState: profileState });
    await screen.findByText("Dompet hitam");
    await userEvent.click(screen.getByRole("button", { name: "Hapus Dompet hitam" }));
    await waitFor(() => expect(lostFoundApi.deleteLostFound).toHaveBeenCalledWith(1));
    await waitFor(() => expect(lostFoundApi.getLostFounds).toHaveBeenCalledTimes(2));
  });

  it("hapus dibatalkan tidak memanggil API", async () => {
    showConfirmDialog.mockResolvedValue(false);
    renderWithProviders(<HomePage />, { preloadedState: profileState });
    await screen.findByText("Dompet hitam");
    await userEvent.click(screen.getByRole("button", { name: "Hapus Dompet hitam" }));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(lostFoundApi.deleteLostFound).not.toHaveBeenCalled();
  });

  it.each([
    ["ditambah", setIsLostFoundAddedAction],
    ["diubah", setIsLostFoundChangedAction],
    ["dihapus", setIsLostFoundDeletedAction],
  ])("memuat ulang daftar setelah laporan %s", async (_label, action) => {
    const { store } = renderWithProviders(<HomePage />, { preloadedState: profileState });
    await screen.findByText("Dompet hitam");
    act(() => { store.dispatch(action(true)); });
    await waitFor(() => expect(lostFoundApi.getLostFounds).toHaveBeenCalledTimes(2));
    expect(store.getState().lostFounds.isLostFoundAdded).toBe(false);
  });

  it("menampilkan daftar kosong jika API gagal", async () => {
    lostFoundApi.getLostFounds.mockRejectedValue(new Error("down"));
    renderWithProviders(<HomePage />);
    expect(await screen.findByText("Tidak ada laporan yang cocok.")).toBeInTheDocument();
  });
});
