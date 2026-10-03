import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  getInitial,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("showSuccessDialog memanggil Swal dengan ikon success", () => {
    showSuccessDialog("ok");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "ok" }));
  });

  it("showErrorDialog memanggil Swal dengan ikon error", () => {
    showErrorDialog("gagal");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "gagal" }));
  });

  it("showConfirmDialog mengembalikan isConfirmed", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });
    expect(await showConfirmDialog("hapus?")).toBe(true);
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("hapus?")).toBe(false);
  });

  it("formatDate memformat tanggal valid dan menangani nilai tidak valid", () => {
    expect(formatDate("2024-02-28T07:49:32.000000Z")).toMatch(/2024/);
    expect(formatDate(null)).toBe("-");
    expect(formatDate("bukan tanggal")).toBe("-");
  });

  it("getInitial mengambil huruf pertama", () => {
    expect(getInitial("  dian")).toBe("D");
    expect(getInitial("")).toBe("?");
    expect(getInitial(undefined)).toBe("?");
  });
});
