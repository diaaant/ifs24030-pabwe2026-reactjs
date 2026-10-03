import { describe, it, expect } from "vitest";
import { createStore, store } from "./store";

describe("store", () => {
  it("menggabungkan reducer auth, users, dan lostFounds", () => {
    expect(Object.keys(store.getState()).sort()).toEqual(["auth", "lostFounds", "users"]);
  });

  it("createStore menerima preloaded state", () => {
    const custom = createStore({ auth: { isAuthLogin: true, isAuthRegister: false, isAuthLogout: false } });
    expect(custom.getState().auth.isAuthLogin).toBe(true);
  });
});
