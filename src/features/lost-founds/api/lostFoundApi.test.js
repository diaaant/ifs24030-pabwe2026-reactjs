import { describe, it, expect, vi, beforeEach } from "vitest";
import lostFoundApi from "./lostFoundApi";
import { api } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe("lostFoundApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getLostFounds meneruskan filter sebagai query", async () => {
    api.get.mockResolvedValue({ data: { lost_founds: [{ id: 1 }] } });
    const filters = { status: "lost", is_completed: "0", is_me: 1 };
    expect(await lostFoundApi.getLostFounds(filters)).toEqual([{ id: 1 }]);
    expect(api.get).toHaveBeenCalledWith("/lost-founds", { query: filters });
  });

  it("getLostFounds tanpa argumen memakai filter kosong", async () => {
    api.get.mockResolvedValue({ data: { lost_founds: [] } });
    await lostFoundApi.getLostFounds();
    expect(api.get).toHaveBeenCalledWith("/lost-founds", { query: {} });
  });

  it("getLostFound", async () => {
    api.get.mockResolvedValue({ data: { lost_found: { id: 9 } } });
    expect(await lostFoundApi.getLostFound(9)).toEqual({ id: 9 });
    expect(api.get).toHaveBeenCalledWith("/lost-founds/9");
  });

  it("addLostFound mengembalikan id baru", async () => {
    api.post.mockResolvedValue({ data: { lost_found_id: 5 } });
    const payload = { title: "T", description: "D", status: "lost", ekstra: "dibuang" };
    expect(await lostFoundApi.addLostFound(payload)).toBe(5);
    expect(api.post).toHaveBeenCalledWith("/lost-founds", {
      body: { title: "T", description: "D", status: "lost" },
    });
  });

  it("changeLostFound", async () => {
    api.put.mockResolvedValue({ status: "success" });
    const payload = { title: "T", description: "D", status: "found", is_completed: 1 };
    await lostFoundApi.changeLostFound(3, payload);
    expect(api.put).toHaveBeenCalledWith("/lost-founds/3", { body: payload });
  });

  it("changeCover mengirim FormData berisi cover", async () => {
    api.post.mockResolvedValue({ status: "success" });
    const file = new File(["x"], "c.png", { type: "image/png" });
    await lostFoundApi.changeCover(3, file);
    const [path, options] = api.post.mock.calls[0];
    expect(path).toBe("/lost-founds/3/cover");
    expect(options.body.get("cover")).toBe(file);
  });

  it("deleteLostFound", async () => {
    api.delete.mockResolvedValue({ status: "success" });
    await lostFoundApi.deleteLostFound(4);
    expect(api.delete).toHaveBeenCalledWith("/lost-founds/4");
  });

  it("statistik harian dan bulanan memakai total_data", async () => {
    api.get.mockResolvedValue({ data: { stats_losts: {} } });
    await lostFoundApi.getStatsDaily(7);
    await lostFoundApi.getStatsMonthly(6);
    expect(api.get).toHaveBeenNthCalledWith(1, "/lost-founds/stats/daily", { query: { total_data: 7 } });
    expect(api.get).toHaveBeenNthCalledWith(2, "/lost-founds/stats/monthly", { query: { total_data: 6 } });
  });
});
