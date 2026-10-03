import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import userApi from "../../users/api/userApi";
import LostFoundLayout from "./LostFoundLayout";

vi.mock("../../users/api/userApi", () => ({
  default: { getProfile: vi.fn() },
}));

const ui = (
  <Routes>
    <Route element={<LostFoundLayout />}>
      <Route index element={<p>Isi halaman</p>} />
    </Route>
    <Route path="/auth/login" element={<p>Halaman login</p>} />
  </Routes>
);

describe("LostFoundLayout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mengarahkan ke login jika tidak ada token", () => {
    renderWithProviders(ui);
    expect(screen.getByText("Halaman login")).toBeInTheDocument();
    expect(userApi.getProfile).not.toHaveBeenCalled();
  });

  it("memuat profil dan menampilkan navbar, sidebar, dan outlet", async () => {
    putAccessToken("tok");
    userApi.getProfile.mockResolvedValue({ id: 1, name: "Dian", email: "d@x.y", photo: null });
    renderWithProviders(ui);
    expect(screen.getByText("Isi halaman")).toBeInTheDocument();
    expect(await screen.findByText("Dian", { selector: "span.hidden" })).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("tombol menu membuka sidebar mobile dan overlay menutupnya", async () => {
    putAccessToken("tok");
    userApi.getProfile.mockResolvedValue({ id: 1, name: "Dian", email: "d@x.y", photo: null });
    renderWithProviders(ui);
    await screen.findByText("Dian", { selector: "span.hidden" });
    await userEvent.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(screen.getByRole("complementary")).toHaveClass("translate-x-0");
    await userEvent.click(screen.getByTestId("sidebar-overlay"));
    expect(screen.getByRole("complementary")).toHaveClass("-translate-x-full");
  });

  it("mengarahkan ke login dan menghapus token jika profil gagal dimuat", async () => {
    putAccessToken("kadaluarsa");
    userApi.getProfile.mockRejectedValue(new Error("Unauthenticated."));
    renderWithProviders(ui);
    expect(await screen.findByText("Halaman login")).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });
});
