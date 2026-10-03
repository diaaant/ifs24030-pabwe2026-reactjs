import { describe, it, expect, vi, beforeEach } from "vitest";
import userReducer, { initialUserState } from "./userSlice";
import * as actions from "./userActions";
import * as thunks from "./userThunks";
import userApi from "../api/userApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/userApi", () => ({
  default: {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    updatePhoto: vi.fn(),
    updatePassword: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("user reducer", () => {
  it("menangani seluruh action", () => {
    let state = userReducer(undefined, { type: "@@init" });
    expect(state).toEqual(initialUserState);
    state = userReducer(state, actions.setUsersAction([1]));
    state = userReducer(state, actions.setUserAction({ id: 2 }));
    state = userReducer(state, actions.setProfileAction({ id: 3 }));
    state = userReducer(state, actions.setIsChangeProfileAction(true));
    state = userReducer(state, actions.setIsChangeProfilePhotoAction(true));
    state = userReducer(state, actions.setIsChangeProfilePasswordAction(true));
    expect(state).toEqual({
      users: [1],
      user: { id: 2 },
      profile: { id: 3 },
      isProfile: true,
      isChangeProfile: true,
      isChangeProfilePhoto: true,
      isChangeProfilePassword: true,
    });
    state = userReducer(state, actions.resetUserFlagsAction());
    expect(state.isChangeProfile).toBe(false);
    expect(state.isChangeProfilePhoto).toBe(false);
    expect(state.isChangeProfilePassword).toBe(false);
    expect(state.profile).toEqual({ id: 3 });
    expect(userReducer(state, actions.resetUserAction())).toEqual(initialUserState);
  });
});

describe("user thunks", () => {
  const dispatch = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("asyncGetUsers berhasil & gagal", async () => {
    userApi.getUsers.mockResolvedValueOnce([{ id: 1 }]);
    await thunks.asyncGetUsers()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setUsersAction([{ id: 1 }]));
    userApi.getUsers.mockRejectedValueOnce(new Error("x"));
    await thunks.asyncGetUsers()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setUsersAction([]));
    expect(showErrorDialog).toHaveBeenCalledWith("x");
  });

  it("asyncGetUser berhasil & gagal", async () => {
    userApi.getUserById.mockResolvedValueOnce({ id: 1 });
    await thunks.asyncGetUser(1)(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setUserAction({ id: 1 }));
    userApi.getUserById.mockRejectedValueOnce(new Error("y"));
    await thunks.asyncGetUser(1)(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setUserAction(null));
    expect(showErrorDialog).toHaveBeenCalledWith("y");
  });

  it("asyncGetProfile berhasil", async () => {
    userApi.getProfile.mockResolvedValue({ id: 1 });
    await thunks.asyncGetProfile()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setProfileAction({ id: 1 }));
  });

  it("asyncGetProfile gagal menghapus token", async () => {
    putAccessToken("tok");
    userApi.getProfile.mockRejectedValue(new Error("401"));
    await thunks.asyncGetProfile()(dispatch);
    expect(getAccessToken()).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(actions.setProfileAction(null));
  });

  it("asyncChangeProfile berhasil & gagal", async () => {
    userApi.updateProfile.mockResolvedValueOnce({ id: 1, name: "N" });
    await thunks.asyncChangeProfile({ name: "N" })(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setProfileAction({ id: 1, name: "N" }));
    expect(dispatch).toHaveBeenCalledWith(actions.setIsChangeProfileAction(true));
    expect(showSuccessDialog).toHaveBeenCalled();
    userApi.updateProfile.mockRejectedValueOnce(new Error("z"));
    await thunks.asyncChangeProfile({})(dispatch);
    expect(showErrorDialog).toHaveBeenCalledWith("z");
  });

  it("asyncChangeProfilePhoto berhasil & gagal", async () => {
    userApi.updatePhoto.mockResolvedValueOnce({});
    await thunks.asyncChangeProfilePhoto("file")(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setIsChangeProfilePhotoAction(true));
    expect(dispatch).toHaveBeenCalledTimes(2); // refresh profil + flag
    userApi.updatePhoto.mockRejectedValueOnce(new Error("foto"));
    await thunks.asyncChangeProfilePhoto("file")(dispatch);
    expect(showErrorDialog).toHaveBeenCalledWith("foto");
  });

  it("asyncChangeProfilePassword berhasil & gagal", async () => {
    userApi.updatePassword.mockResolvedValueOnce({});
    await thunks.asyncChangeProfilePassword({})(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setIsChangeProfilePasswordAction(true));
    userApi.updatePassword.mockRejectedValueOnce(new Error("pw"));
    await thunks.asyncChangeProfilePassword({})(dispatch);
    expect(showErrorDialog).toHaveBeenCalledWith("pw");
  });
});
