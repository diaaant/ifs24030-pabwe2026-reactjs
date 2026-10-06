import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/lostFoundApi";
import {
  isLostFoundAdded,
  isLostFoundChange,
  isLostFoundChangeCover,
  isLostFoundChanged,
  isLostFoundChangedCover,
} from "../states/reducer";
import AddModal from "./AddModal";
import ChangeModal from "./ChangeModal";
import ChangeCoverModal from "./ChangeCoverModal";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue({}),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const item = {
  id: 7,
  title: "Dompet",
  description: "Dompet hitam",
  status: "found",
  is_completed: 0,
  cover: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.URL.createObjectURL = vi.fn(() => "blob:preview");
  globalThis.URL.revokeObjectURL = vi.fn();
});

describe("AddModal", () => {
  it("menutup diri jika flag berhasil menyala", async () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(<AddModal onClose={onClose} />);
    act(() => {
      store.dispatch(isLostFoundAdded(true));
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

describe("ChangeModal", () => {
  it("menampilkan data awal laporan", () => {
    renderWithProviders(<ChangeModal item={item} onClose={() => {}} />);
    expect(screen.getByLabelText("Judul")).toHaveValue("Dompet");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Dompet hitam");
  });

  it("tombol Tutup menutup modal", async () => {
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal item={item} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("menutup diri jika flag berhasil menyala", async () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(
      <ChangeModal item={item} onClose={onClose} />,
    );
    act(() => {
      store.dispatch(isLostFoundChanged(true));
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

describe("ChangeCoverModal", () => {
  const image = () => new File(["x"], "cover.png", { type: "image/png" });

  it("tanpa cover menampilkan placeholder dan tombol unggah nonaktif", () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);
    expect(screen.getByText("Belum ada gambar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unggah cover" })).toBeDisabled();
  });

  it("menampilkan cover yang sudah ada sebagai pratinjau", () => {
    renderWithProviders(
      <ChangeCoverModal
        item={{ ...item, cover: "img/lost-founds/cover/1.png" }}
        onClose={() => {}}
      />,
    );
    expect(screen.getByAltText("Pratinjau cover")).toHaveAttribute(
      "src",
      expect.stringContaining("img/lost-founds/cover/1.png"),
    );
  });

  it("memilih gambar menampilkan pratinjau lalu mengunggah", async () => {
    api.postLostFoundCover.mockResolvedValue({});
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal item={item} onClose={onClose} />);
    const file = image();
    fireEvent.change(screen.getByLabelText("Berkas gambar"), {
      target: { files: [file] },
    });
    expect(screen.getByAltText("Pratinjau cover")).toHaveAttribute(
      "src",
      "blob:preview",
    );
    await userEvent.click(screen.getByRole("button", { name: "Unggah cover" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.postLostFoundCover).toHaveBeenCalledWith(7, file);
  });

  it("menolak file non-gambar dengan pesan error", () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);
    const pdf = new File(["x"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Berkas gambar"), {
      target: { files: [pdf] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "File harus berupa gambar",
    );
    expect(screen.getByRole("button", { name: "Unggah cover" })).toBeDisabled();
  });

  it("pesan error hilang setelah memilih gambar yang benar", () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);
    const input = screen.getByLabelText("Berkas gambar");
    fireEvent.change(input, {
      target: {
        files: [new File(["x"], "a.pdf", { type: "application/pdf" })],
      },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.change(input, { target: { files: [image()] } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("mengabaikan pemilihan file yang dibatalkan", () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText("Berkas gambar"), {
      target: { files: [] },
    });
    expect(screen.getByRole("button", { name: "Unggah cover" })).toBeDisabled();
  });

  it("tombol Tutup menutup modal", async () => {
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal item={item} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("menampilkan status mengunggah saat proses berjalan", async () => {
    const { store } = renderWithProviders(
      <ChangeCoverModal item={item} onClose={() => {}} />,
    );
    act(() => {
      store.dispatch(isLostFoundChangeCover(true));
    });
    expect(
      await screen.findByRole("button", { name: "Mengunggah..." }),
    ).toBeDisabled();
  });

  it("menutup diri jika flag berhasil menyala", async () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(
      <ChangeCoverModal item={item} onClose={onClose} />,
    );
    act(() => {
      store.dispatch(isLostFoundChangedCover(true));
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
