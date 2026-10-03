import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  BASE_URL,
  api,
  assetUrl,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  request,
} from "./apiHelper";

const mockFetch = (body, ok = true, status = 200) => {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => (body === undefined ? Promise.reject(new Error("bad json")) : Promise.resolve(body)),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
};

describe("apiHelper", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("assetUrl menangani null, url absolut, dan path relatif", () => {
    expect(assetUrl(null)).toBeNull();
    expect(assetUrl("https://x.test/a.png")).toBe("https://x.test/a.png");
    expect(assetUrl("img/a.png")).toBe(`${new URL(BASE_URL).origin}/img/a.png`);
    expect(assetUrl("/img/a.png")).toBe(`${new URL(BASE_URL).origin}/img/a.png`);
  });

  it("mengirim GET dengan query (nilai kosong dibuang) dan bearer token", async () => {
    putAccessToken("tok");
    const fetchMock = mockFetch({ status: "success", data: 1 });
    const json = await request("/lost-founds", {
      query: { status: "lost", is_completed: "", is_me: undefined, x: null, y: 0 },
    });
    expect(json.data).toBe(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/lost-founds?status=lost&y=0`);
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer tok");
    expect(options.body).toBeUndefined();
  });

  it("tanpa query tidak menambahkan tanda tanya", async () => {
    const fetchMock = mockFetch({ status: "success" });
    await request("/users");
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/users`);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("auth=false tidak mengirim Authorization walau token ada", async () => {
    putAccessToken("tok");
    const fetchMock = mockFetch({ status: "success" });
    await request("/auth/login", { method: "POST", auth: false, body: { a: 1 } });
    const options = fetchMock.mock.calls[0][1];
    expect(options.headers.Authorization).toBeUndefined();
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("mengirim FormData tanpa Content-Type manual", async () => {
    const fetchMock = mockFetch({ status: "success" });
    const form = new FormData();
    await request("/x", { method: "POST", body: form });
    const options = fetchMock.mock.calls[0][1];
    expect(options.body).toBe(form);
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("melempar error berisi pesan dan detail validasi", async () => {
    mockFetch(
      { status: "fail", message: "Data tidak valid", data: { email: ["Wajib diisi", "Format salah"] } },
      false,
      400,
    );
    await expect(request("/x")).rejects.toMatchObject({
      message: "Data tidak valid: Wajib diisi, Format salah",
      status: 400,
    });
  });

  it("melempar error hanya dengan pesan jika tidak ada detail", async () => {
    mockFetch({ status: "fail", message: "Kredensial akun tidak ditemukan" }, false, 401);
    await expect(request("/x")).rejects.toThrow("Kredensial akun tidak ditemukan");
  });

  it("mengabaikan data non-objek", async () => {
    mockFetch({ status: "fail", message: "Gagal", data: "teks" }, false, 400);
    await expect(request("/x")).rejects.toThrow("Gagal");
  });

  it("memakai pesan default jika respons bukan JSON", async () => {
    mockFetch(undefined, false, 500);
    await expect(request("/x")).rejects.toThrow("Terjadi kesalahan pada server");
  });

  it("menganggap status bukan success sebagai error walau HTTP 200", async () => {
    mockFetch({ status: "fail", message: "Ditolak" }, true, 200);
    await expect(request("/x")).rejects.toThrow("Ditolak");
  });

  it("helper api memakai method yang sesuai", async () => {
    const fetchMock = mockFetch({ status: "success" });
    await api.get("/a");
    await api.post("/a");
    await api.put("/a");
    await api.delete("/a");
    expect(fetchMock.mock.calls.map((c) => c[1].method)).toEqual(["GET", "POST", "PUT", "DELETE"]);
  });
});
