import { describe, it, expect, vi, beforeEach } from "vitest";
import authReducer, { initialAuthState } from "./authSlice";
import * as actions from "./authActions";
import { AUTH_LOGIN_SET } from "./authActionTypes";
import { asyncLogin, asyncLogout, asyncRegister } from "./authThunks";
import authApi from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { resetUserAction } from "../../users/states/userActions";

vi.mock("../api/authApi", () => ({
  default: { login: vi.fn(), register: vi.fn(), logout: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("auth actions & reducer", () => {
  it("action creator memakai tipe yang benar", () => {
    expect(actions.setIsAuthLoginAction(true)).toEqual({ type: AUTH_LOGIN_SET, payload: true });
  });

  it("reducer mengubah flag dan bisa direset", () => {
    let state = authReducer(undefined, { type: "@@init" });
    expect(state).toEqual(initialAuthState);
    state = authReducer(state, actions.setIsAuthLoginAction(true));
    state = authReducer(state, actions.setIsAuthRegisterAction(true));
    state = authReducer(state, actions.setIsAuthLogoutAction(true));
    expect(state).toEqual({ isAuthLogin: true, isAuthRegister: true, isAuthLogout: true });
    expect(authReducer(state, actions.resetAuthAction())).toEqual(initialAuthState);
  });
});

describe("auth thunks", () => {
  const dispatch = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("asyncLogin menyimpan token lalu menandai login berhasil", async () => {
    authApi.login.mockResolvedValue({ token: "tok" });
    await asyncLogin({ email: "a", password: "b" })(dispatch);
    expect(getAccessToken()).toBe("tok");
    expect(dispatch).toHaveBeenCalledWith(resetUserAction());
    expect(dispatch).toHaveBeenCalledWith(actions.setIsAuthLoginAction(true));
  });

  it("asyncLogin menampilkan error jika gagal", async () => {
    authApi.login.mockRejectedValue(new Error("Kredensial salah"));
    await asyncLogin({})(dispatch);
    expect(showErrorDialog).toHaveBeenCalledWith("Kredensial salah");
    expect(dispatch).not.toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
  });

  it("asyncRegister berhasil", async () => {
    authApi.register.mockResolvedValue({});
    await asyncRegister({})(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setIsAuthRegisterAction(true));
    expect(showSuccessDialog).toHaveBeenCalled();
  });

  it("asyncRegister gagal", async () => {
    authApi.register.mockRejectedValue(new Error("Email dipakai"));
    await asyncRegister({})(dispatch);
    expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai");
  });

  it("asyncLogout menghapus token", async () => {
    putAccessToken("tok");
    authApi.logout.mockResolvedValue({});
    await asyncLogout()(dispatch);
    expect(getAccessToken()).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(actions.setIsAuthLogoutAction(true));
  });

  it("asyncLogout tetap menghapus token walau request gagal", async () => {
    putAccessToken("tok");
    authApi.logout.mockRejectedValue(new Error("401"));
    await asyncLogout()(dispatch);
    expect(getAccessToken()).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(actions.setIsAuthLogoutAction(true));
  });
});
