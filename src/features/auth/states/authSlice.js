import { createSlice } from "@reduxjs/toolkit";
import {
  setIsAuthLoginAction,
  setIsAuthRegisterAction,
  setIsAuthLogoutAction,
  resetAuthAction,
} from "./authActions";

export const initialAuthState = {
  isAuthLogin: false,
  isAuthRegister: false,
  isAuthLogout: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setIsAuthLoginAction, (state, action) => {
        state.isAuthLogin = action.payload;
      })
      .addCase(setIsAuthRegisterAction, (state, action) => {
        state.isAuthRegister = action.payload;
      })
      .addCase(setIsAuthLogoutAction, (state, action) => {
        state.isAuthLogout = action.payload;
      })
      .addCase(resetAuthAction, () => initialAuthState);
  },
});

export default authSlice.reducer;
