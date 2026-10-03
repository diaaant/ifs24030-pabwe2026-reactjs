import userApi from "../api/userApi";
import { removeAccessToken } from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  setUsersAction,
  setUserAction,
  setProfileAction,
  setIsChangeProfileAction,
  setIsChangeProfilePhotoAction,
  setIsChangeProfilePasswordAction,
} from "./userActions";

export const asyncGetUsers = () => async (dispatch) => {
  try {
    dispatch(setUsersAction(await userApi.getUsers()));
  } catch (error) {
    dispatch(setUsersAction([]));
    await showErrorDialog(error.message);
  }
};

export const asyncGetUser = (id) => async (dispatch) => {
  try {
    dispatch(setUserAction(await userApi.getUserById(id)));
  } catch (error) {
    dispatch(setUserAction(null));
    await showErrorDialog(error.message);
  }
};

// Jika profil gagal dimuat (mis. token kadaluarsa) token dihapus,
// sehingga route guard mengarahkan pengguna ke halaman login.
export const asyncGetProfile = () => async (dispatch) => {
  try {
    dispatch(setProfileAction(await userApi.getProfile()));
  } catch {
    removeAccessToken();
    dispatch(setProfileAction(null));
  }
};

export const asyncChangeProfile = (payload) => async (dispatch) => {
  try {
    dispatch(setProfileAction(await userApi.updateProfile(payload)));
    dispatch(setIsChangeProfileAction(true));
    await showSuccessDialog("Profil berhasil diperbarui.");
  } catch (error) {
    await showErrorDialog(error.message);
  }
};

export const asyncChangeProfilePhoto = (file) => async (dispatch) => {
  try {
    await userApi.updatePhoto(file);
    await dispatch(asyncGetProfile());
    dispatch(setIsChangeProfilePhotoAction(true));
    await showSuccessDialog("Foto profil berhasil diperbarui.");
  } catch (error) {
    await showErrorDialog(error.message);
  }
};

export const asyncChangeProfilePassword = (payload) => async (dispatch) => {
  try {
    await userApi.updatePassword(payload);
    dispatch(setIsChangeProfilePasswordAction(true));
    await showSuccessDialog("Kata sandi berhasil diubah.");
  } catch (error) {
    await showErrorDialog(error.message);
  }
};
