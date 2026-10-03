import { createAction } from "@reduxjs/toolkit";
import {
  AUTH_LOGIN_SET,
  AUTH_REGISTER_SET,
  AUTH_LOGOUT_SET,
  AUTH_RESET,
} from "./authActionTypes";

export const setIsAuthLoginAction = createAction(AUTH_LOGIN_SET);
export const setIsAuthRegisterAction = createAction(AUTH_REGISTER_SET);
export const setIsAuthLogoutAction = createAction(AUTH_LOGOUT_SET);
export const resetAuthAction = createAction(AUTH_RESET);
