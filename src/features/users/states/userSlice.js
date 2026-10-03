import { createSlice } from "@reduxjs/toolkit";
import {
  setUsersAction,
  setUserAction,
  setProfileAction,
  setIsChangeProfileAction,
  setIsChangeProfilePhotoAction,
  setIsChangeProfilePasswordAction,
  resetUserFlagsAction,
  resetUserAction,
} from "./userActions";

export const initialUserState = {
  users: null,
  user: null,
  profile: null,
  isProfile: false, // true setelah proses ambil profil selesai (berhasil/gagal)
  isChangeProfile: false,
  isChangeProfilePhoto: false,
  isChangeProfilePassword: false,
};

const userSlice = createSlice({
  name: "users",
  initialState: initialUserState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setUsersAction, (state, action) => {
        state.users = action.payload;
      })
      .addCase(setUserAction, (state, action) => {
        state.user = action.payload;
      })
      .addCase(setProfileAction, (state, action) => {
        state.profile = action.payload;
        state.isProfile = true;
      })
      .addCase(setIsChangeProfileAction, (state, action) => {
        state.isChangeProfile = action.payload;
      })
      .addCase(setIsChangeProfilePhotoAction, (state, action) => {
        state.isChangeProfilePhoto = action.payload;
      })
      .addCase(setIsChangeProfilePasswordAction, (state, action) => {
        state.isChangeProfilePassword = action.payload;
      })
      .addCase(resetUserAction, () => initialUserState)
      .addCase(resetUserFlagsAction, (state) => {
        state.isChangeProfile = false;
        state.isChangeProfilePhoto = false;
        state.isChangeProfilePassword = false;
      });
  },
});

export default userSlice.reducer;
