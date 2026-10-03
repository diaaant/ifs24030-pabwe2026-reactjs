import { describe, it, expect, vi, beforeEach } from "vitest";
import userApi from "./userApi";
import { api } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe("userApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getUsers", async () => {
    api.get.mockResolvedValue({ data: { users: [{ id: 1 }] } });
    expect(await userApi.getUsers()).toEqual([{ id: 1 }]);
    expect(api.get).toHaveBeenCalledWith("/users");
  });

  it("getUserById", async () => {
    api.get.mockResolvedValue({ data: { user: { id: 2 } } });
    expect(await userApi.getUserById(2)).toEqual({ id: 2 });
    expect(api.get).toHaveBeenCalledWith("/users/2");
  });

  it("getProfile", async () => {
    api.get.mockResolvedValue({ data: { user: { id: 3 } } });
    expect(await userApi.getProfile()).toEqual({ id: 3 });
    expect(api.get).toHaveBeenCalledWith("/users/me");
  });

  it("updateProfile", async () => {
    api.put.mockResolvedValue({ data: { user: { id: 3, name: "N" } } });
    expect(await userApi.updateProfile({ name: "N", email: "e@x.y" })).toEqual({ id: 3, name: "N" });
    expect(api.put).toHaveBeenCalledWith("/users/me", { body: { name: "N", email: "e@x.y" } });
  });

  it("updatePhoto mengirim FormData berisi photo", async () => {
    api.post.mockResolvedValue({ status: "success" });
    const file = new File(["x"], "a.png", { type: "image/png" });
    await userApi.updatePhoto(file);
    const [path, options] = api.post.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.body.get("photo")).toBe(file);
  });

  it("updatePassword memakai PUT /users/password", async () => {
    api.put.mockResolvedValue({ status: "success" });
    const payload = { password: "a", new_password: "b", new_password_confirmation: "b" };
    await userApi.updatePassword(payload);
    expect(api.put).toHaveBeenCalledWith("/users/password", { body: payload });
  });
});
