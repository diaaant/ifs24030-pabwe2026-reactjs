import { createAction } from "@reduxjs/toolkit";

export const setUsersAction = createAction("users/setUsers");
export const setUserAction = createAction("users/setUser");
export const setProfileAction = createAction("users/setProfile");
export const setIsChangeProfileAction = createAction("users/setIsChangeProfile");
export const setIsChangeProfilePhotoAction = createAction(
  "users/setIsChangeProfilePhoto",
);
export const setIsChangeProfilePasswordAction = createAction(
  "users/setIsChangeProfilePassword",
);
export const resetUserFlagsAction = createAction("users/resetFlags");
export const resetUserAction = createAction("users/reset");
