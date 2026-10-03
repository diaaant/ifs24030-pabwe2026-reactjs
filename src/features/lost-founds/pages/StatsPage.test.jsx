import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import StatsPage from "./StatsPage";

vi.mock("../api/lostFoundApi", () => ({
  default: { getStatsDaily: vi.fn(), getStatsMonthly: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
}));

const make = (keys, lost, found, lostDone, foundDone) => {
  const build = (values) => Object.fromEntries(keys.map((k, i) => [k, values[i]]));
  return {
    stats_losts: build(lost),
    stats_losts_completed: build(lostDone),
    stats_losts_process: build(lost),
    stats_founds: build(found),
    stats_founds_completed: build(foundDone),
    stats_founds_process: build(found),
  };
};
const daily = make(["01-10-2026", "02-10-2026"], [2, 0], [1, 3], [1, 0], [0, 2]);
const monthly = make(["09-2026", "10-2026"], [0, 0], [0, 0], [0, 0], [0, 0]);

describe("StatsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lostFoundApi.getStatsDaily.mockResolvedValue(daily);
    lostFoundApi.getStatsMonthly.mockResolvedValue(monthly);
  });

  it("menampilkan loading lalu statistik harian", async () => {
    renderWithProviders(<StatsPage />);
    expect(screen.getByText("Memuat statistik...")).toBeInTheDocument();
    expect(await screen.findByText("01-10-2026")).toBeInTheDocument();
    const cardValue = (label) => within(screen.getByText(label).parentElement).getByText(/^\d+$/);
    expect(cardValue("Total laporan")).toHaveTextContent("6");
    expect(cardValue("Barang hilang")).toHaveTextContent("2");
    expect(cardValue("Barang ditemukan")).toHaveTextContent("4");
    expect(cardValue("Selesai")).toHaveTextContent("3");
    expect(screen.getByText("7 hari terakhir")).toBeInTheDocument();
    expect(screen.getByText("2 / 1")).toBeInTheDocument();
  });

  it("beralih ke statistik bulanan (semua nol tetap valid)", async () => {
    renderWithProviders(<StatsPage />);
    await screen.findByText("01-10-2026");
    await userEvent.click(screen.getByRole("button", { name: "Bulanan" }));
    expect(screen.getByText("6 bulan terakhir")).toBeInTheDocument();
    expect(screen.getByText("09-2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bulanan" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Harian" }));
    expect(screen.getByText("7 hari terakhir")).toBeInTheDocument();
  });
});
