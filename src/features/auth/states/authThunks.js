import authApi from "../api/authApi";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  setIsAuthLoginAction,
  setIsAuthRegisterAction,
  setIsAuthLogoutAction,
} from "./authActions";
import { resetUserAction } from "../../users/states/userActions";

export const asyncLogin = (credentials) => async (dispatch) => {
  try {
    const { token } = await authApi.login(credentials);
    putAccessToken(token);
    dispatch(resetUserAction()); // buang profil lama agar dimuat ulang
    dispatch(setIsAuthLoginAction(true));
  } catch (error) {
    await showErrorDialog(error.message);
  }
};

export const asyncRegister = (payload) => async (dispatch) => {
  try {
    await authApi.register(payload);
    dispatch(setIsAuthRegisterAction(true));
    await showSuccessDialog("Pendaftaran berhasil, silakan masuk.");
  } catch (error) {
    await showErrorDialog(error.message);
  }
};

export const asyncLogout = () => async (dispatch) => {
  try {
    await authApi.logout();
  } catch {
    // token lokal tetap dihapus walau token di server sudah tidak valid
  }
  removeAccessToken();
  dispatch(resetUserAction());
  dispatch(setIsAuthLogoutAction(true));
};
