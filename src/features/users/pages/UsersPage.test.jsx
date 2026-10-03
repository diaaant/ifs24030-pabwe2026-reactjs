import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../api/userApi";
import UsersPage from "./UsersPage";

vi.mock("../api/userApi", () => ({ default: { getUsers: vi.fn() } }));
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
}));

const users = [
  { id: 1, name: "Dian Rafael", email: "dian@del.ac.id", photo: "http://x.test/p.png", created_at: "2024-10-05T03:26:57.000000Z" },
  { id: 2, name: "Budi", email: "budi@del.ac.id", photo: null, created_at: "2024-10-06T03:26:57.000000Z" },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userApi.getUsers.mockResolvedValue(users);
  });

  it("menampilkan loading lalu daftar pengguna", async () => {
    renderWithProviders(<UsersPage />);
    expect(screen.getByText("Memuat pengguna...")).toBeInTheDocument();
    expect(await screen.findByText("Dian Rafael")).toBeInTheDocument();
    expect(screen.getByText("budi@del.ac.id")).toBeInTheDocument();
    expect(screen.getByAltText("Dian Rafael")).toBeInTheDocument();
  });

  it("pencarian menyaring dan menampilkan keadaan kosong", async () => {
    renderWithProviders(<UsersPage />);
    await screen.findByText("Dian Rafael");
    await userEvent.type(screen.getByLabelText("Cari pengguna"), "budi");
    expect(screen.queryByText("Dian Rafael")).not.toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("Cari pengguna"));
    await userEvent.type(screen.getByLabelText("Cari pengguna"), "zzz");
    expect(screen.getByText("Pengguna tidak ditemukan.")).toBeInTheDocument();
  });

  it("menampilkan keadaan kosong jika API gagal", async () => {
    userApi.getUsers.mockRejectedValue(new Error("down"));
    renderWithProviders(<UsersPage />);
    expect(await screen.findByText("Pengguna tidak ditemukan.")).toBeInTheDocument();
  });
});
