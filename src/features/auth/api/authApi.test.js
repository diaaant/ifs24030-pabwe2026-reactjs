import { describe, it, expect, vi, beforeEach } from "vitest";
import authApi from "./authApi";
import { api } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe("authApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("login memanggil POST /auth/login dan mengembalikan data", async () => {
    api.post.mockResolvedValue({ data: { token: "t", user: { id: 1 } } });
    const data = await authApi.login({ email: "a@b.c", password: "123456" });
    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      body: { email: "a@b.c", password: "123456" },
      auth: false,
    });
    expect(data.token).toBe("t");
  });

  it("register memanggil POST /auth/register", async () => {
    api.post.mockResolvedValue({ status: "success" });
    await authApi.register({ name: "N", email: "a@b.c", password: "123456" });
    expect(api.post).toHaveBeenCalledWith("/auth/register", {
      body: { name: "N", email: "a@b.c", password: "123456" },
      auth: false,
    });
  });

  it("logout memanggil POST /auth/logout", async () => {
    api.post.mockResolvedValue({ status: "success" });
    await authApi.logout();
    expect(api.post).toHaveBeenCalledWith("/auth/logout");
  });
});
