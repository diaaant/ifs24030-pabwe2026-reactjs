import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Avatar from "./Avatar";
import StatusBadge from "./StatusBadge";
import ModalShell from "./ModalShell";

describe("Avatar", () => {
  it("menampilkan gambar jika ada foto", () => {
    render(<Avatar name="Dian" photo="https://x.test/p.png" />);
    expect(screen.getByAltText("Foto Dian")).toHaveAttribute("src", "https://x.test/p.png");
  });

  it("menampilkan inisial jika tidak ada foto", () => {
    render(<Avatar name="Dian" photo={null} className="h-20 w-20" />);
    expect(screen.getByLabelText("Inisial Dian")).toHaveTextContent("D");
  });

  it("memakai ukuran default", () => {
    render(<Avatar name="Rafael" />);
    expect(screen.getByLabelText("Inisial Rafael")).toHaveClass("h-9");
  });
});

describe("StatusBadge", () => {
  it("lost belum selesai", () => {
    render(<StatusBadge status="lost" isCompleted={0} />);
    expect(screen.getByText("Hilang")).toBeInTheDocument();
    expect(screen.queryByText("Selesai")).not.toBeInTheDocument();
  });

  it("found selesai", () => {
    render(<StatusBadge status="found" isCompleted={1} />);
    expect(screen.getByText("Ditemukan")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
  });
});

describe("ModalShell", () => {
  it("menampilkan judul, isi, dan menutup lewat tombol", async () => {
    const onClose = vi.fn();
    render(
      <ModalShell title="Judul" onClose={onClose}>
        <p>Isi</p>
      </ModalShell>,
    );
    expect(screen.getByRole("dialog", { name: "Judul" })).toBeInTheDocument();
    expect(screen.getByText("Isi")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onClose).toHaveBeenCalled();
  });
});