import { postLogin, postRegister } from "../api/authApi";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { isAuthLogin, isAuthLogout, isAuthRegister } from "./reducer";

export const asyncLogin = (credentials) => async (dispatch) => {
  try {
    const res = await postLogin(credentials);
    const token =
      res?.data?.token ??
      res?.token ??
      res?.access_token ??
      res?.data?.access_token;

    if (!token) throw new Error("Token tidak ditemukan pada respons login.");

    putAccessToken(token);
    dispatch(isAuthLogin(token));
    return true;
  } catch (error) {
    showErrorDialog(error.message);
    return false;
  }
};

export const asyncRegister = (identity) => async (dispatch) => {
  try {
    await postRegister(identity);
    dispatch(isAuthRegister());
    await showSuccessDialog("Akun berhasil dibuat. Silakan masuk.");
    return true;
  } catch (error) {
    showErrorDialog(error.message);
    return false;
  }
};

export const asyncLogout = () => (dispatch) => {
  removeAccessToken();
  dispatch(isAuthLogout());
};