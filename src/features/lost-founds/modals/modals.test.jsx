import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import {
  setIsLostFoundAddedAction,
  setIsLostFoundAddAction,
  setIsLostFoundChangeAction,
  setIsLostFoundChangeCoverAction,
  setIsLostFoundChangedAction,
  setIsLostFoundChangedCoverAction,
} from "../states/lostFoundActions";
import AddModal from "./AddModal";
import ChangeModal from "./ChangeModal";
import ChangeCoverModal from "./ChangeCoverModal";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    addLostFound: vi.fn(),
    changeLostFound: vi.fn(),
    changeCover: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const item = {
  id: 7,
  title: "Dompet",
  description: "Dompet hitam",
  status: "found",
  is_completed: 0,
  cover: null,
};

describe("AddModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mengirim laporan baru dan menutup modal setelah berhasil", async () => {
    lostFoundApi.addLostFound.mockResolvedValue(1);
    const onClose = vi.fn();
    renderWithProviders(<AddModal onClose={onClose} />);
    await userEvent.type(screen.getByLabelText("Judul"), "Kunci");
    await userEvent.type(screen.getByLabelText("Deskripsi"), "Kunci motor");
    await userEvent.selectOptions(screen.getByLabelText("Jenis laporan"), "found");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(lostFoundApi.addLostFound).toHaveBeenCalledWith({
      title: "Kunci",
      description: "Kunci motor",
      status: "found",
    });
  });

  it("status default adalah lost dan tombol batal menutup modal", async () => {
    const onClose = vi.fn();
    renderWithProviders(<AddModal onClose={onClose} />);
    expect(screen.getByLabelText("Jenis laporan")).toHaveValue("lost");
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("menonaktifkan tombol saat proses berjalan", () => {
    const { store } = renderWithProviders(<AddModal onClose={() => {}} />);
    expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled();
    act(() => { store.dispatch(setIsLostFoundAddAction(true)); });
    return waitFor(() =>
      expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled(),
    );
  });

  it("tetap terbuka jika penyimpanan gagal", async () => {
    lostFoundApi.addLostFound.mockRejectedValue(new Error("gagal"));
    const onClose = vi.fn();
    renderWithProviders(<AddModal onClose={onClose} />);
    await userEvent.type(screen.getByLabelText("Judul"), "A");
    await userEvent.type(screen.getByLabelText("Deskripsi"), "B");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(lostFoundApi.addLostFound).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("ChangeModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("terisi data awal dan mengirim perubahan beserta status selesai", async () => {
    lostFoundApi.changeLostFound.mockResolvedValue({});
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal item={item} onClose={onClose} />);
    expect(screen.getByLabelText("Judul")).toHaveValue("Dompet");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Dompet hitam");
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    await userEvent.clear(screen.getByLabelText("Judul"));
    await userEvent.type(screen.getByLabelText("Judul"), "Dompet coklat");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(lostFoundApi.changeLostFound).toHaveBeenCalledWith(7, {
      title: "Dompet coklat",
      description: "Dompet hitam",
      status: "found",
      is_completed: 1,
    });
  });

  it("mengirim is_completed 0 jika tidak dicentang, dan checkbox terisi dari data", async () => {
    lostFoundApi.changeLostFound.mockResolvedValue({});
    renderWithProviders(<ChangeModal item={{ ...item, is_completed: 1 }} onClose={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() =>
      expect(lostFoundApi.changeLostFound).toHaveBeenCalledWith(7, expect.objectContaining({ is_completed: 0 })),
    );
  });

  it("batal menutup modal dan tombol dinonaktifkan saat proses", async () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(<ChangeModal item={item} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalled();
    act(() => { store.dispatch(setIsLostFoundChangeAction(true)); });
    expect(await screen.findByRole("button", { name: "Menyimpan..." })).toBeDisabled();
  });

  it("menutup diri jika flag berhasil menyala", async () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(<ChangeModal item={item} onClose={onClose} />);
    act(() => { store.dispatch(setIsLostFoundChangedAction(true)); });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

describe("ChangeCoverModal", () => {
  beforeEach(() => vi.clearAllMocks());

  const image = () => new File(["x"], "cover.png", { type: "image/png" });

  it("tanpa cover menampilkan placeholder dan tombol unggah nonaktif", () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);
    expect(screen.getByText("Belum ada cover")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unggah" })).toBeDisabled();
  });

  it("menampilkan cover yang sudah ada sebagai pratinjau", () => {
    renderWithProviders(
      <ChangeCoverModal item={{ ...item, cover: "img/lost-founds/cover/1.png" }} onClose={() => {}} />,
    );
    expect(screen.getByAltText("Pratinjau cover")).toHaveAttribute(
      "src",
      expect.stringContaining("img/lost-founds/cover/1.png"),
    );
  });

  it("memilih gambar menampilkan pratinjau lalu mengunggah", async () => {
    lostFoundApi.changeCover.mockResolvedValue({});
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal item={item} onClose={onClose} />);
    const file = image();
    fireEvent.change(screen.getByLabelText("Pilih gambar"), { target: { files: [file] } });
    expect(screen.getByAltText("Pratinjau cover")).toHaveAttribute("src", "blob:preview");
    await userEvent.click(screen.getByRole("button", { name: "Unggah" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(lostFoundApi.changeCover).toHaveBeenCalledWith(7, file);
  });

  it("menolak file non-gambar dengan pesan error", () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);
    const pdf = new File(["x"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Pilih gambar"), { target: { files: [pdf] } });
    expect(screen.getByRole("alert")).toHaveTextContent("File harus berupa gambar");
    expect(screen.getByRole("button", { name: "Unggah" })).toBeDisabled();
  });

  it("pesan error hilang setelah memilih gambar yang benar", () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);
    const input = screen.getByLabelText("Pilih gambar");
    fireEvent.change(input, { target: { files: [new File(["x"], "a.pdf", { type: "application/pdf" })] } });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.change(input, { target: { files: [image()] } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("mengabaikan pemilihan file yang dibatalkan", () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText("Pilih gambar"), { target: { files: [] } });
    expect(screen.getByRole("button", { name: "Unggah" })).toBeDisabled();
  });

  it("batal menutup modal dan menampilkan status mengunggah", async () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(<ChangeCoverModal item={item} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalled();
    act(() => { store.dispatch(setIsLostFoundChangeCoverAction(true)); });
    expect(await screen.findByRole("button", { name: "Mengunggah..." })).toBeDisabled();
  });

  it("menutup diri jika flag berhasil menyala", async () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(<ChangeCoverModal item={item} onClose={onClose} />);
    act(() => { store.dispatch(setIsLostFoundChangedCoverAction(true)); });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("AddModal menutup diri jika flag berhasil menyala", async () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(<AddModal onClose={onClose} />);
    act(() => { store.dispatch(setIsLostFoundAddedAction(true)); });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
