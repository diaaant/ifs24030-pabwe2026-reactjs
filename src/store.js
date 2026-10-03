import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/states/authSlice";
import usersReducer from "./features/users/states/userSlice";
import lostFoundsReducer from "./features/lost-founds/states/lostFoundSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  lostFounds: lostFoundsReducer,
});

export const createStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

export const store = createStore();
