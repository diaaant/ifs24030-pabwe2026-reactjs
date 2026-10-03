import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import { putAccessToken } from "../../../helpers/apiHelper";
import AuthLayout from "./AuthLayout";

const ui = (
  <Routes>
    <Route path="/auth" element={<AuthLayout />}>
      <Route path="login" element={<p>Halaman login</p>} />
    </Route>
    <Route path="/" element={<p>Beranda</p>} />
  </Routes>
);

describe("AuthLayout", () => {
  it("menampilkan outlet jika belum login", () => {
    renderWithProviders(ui, { route: "/auth/login" });
    expect(screen.getByText("Halaman login")).toBeInTheDocument();
    expect(screen.getByText(/Barang hilang di kampus/)).toBeInTheDocument();
  });

  it("mengarahkan ke beranda jika sudah login", () => {
    putAccessToken("tok");
    renderWithProviders(ui, { route: "/auth/login" });
    expect(screen.getByText("Beranda")).toBeInTheDocument();
  });
});
