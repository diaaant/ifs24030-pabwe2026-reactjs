import { createSlice } from "@reduxjs/toolkit";
import * as actions from "./lostFoundActions";

export const initialLostFoundState = {
  lostFounds: null, // null = belum dimuat
  lostFound: null,
  isLostFound: false, // detail sudah selesai dimuat (berhasil/gagal)

  isLostFoundAdd: false, // proses sedang berjalan
  isLostFoundAdded: false, // proses berhasil

  isLostFoundChange: false,
  isLostFoundChanged: false,

  isLostFoundChangeCover: false,
  isLostFoundChangedCover: false,

  isLostFoundDelete: false,
  isLostFoundDeleted: false,

  lostFoundStats: { daily: null, monthly: null },
};

const field = (key) => (state, action) => {
  state[key] = action.payload;
};

const lostFoundSlice = createSlice({
  name: "lostFounds",
  initialState: initialLostFoundState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.setLostFoundsAction, field("lostFounds"))
      .addCase(actions.setLostFoundAction, (state, action) => {
        state.lostFound = action.payload;
        state.isLostFound = true;
      })
      .addCase(actions.clearLostFoundAction, (state) => {
        state.lostFound = null;
        state.isLostFound = false;
      })
      .addCase(actions.setIsLostFoundAddAction, field("isLostFoundAdd"))
      .addCase(actions.setIsLostFoundAddedAction, field("isLostFoundAdded"))
      .addCase(actions.setIsLostFoundChangeAction, field("isLostFoundChange"))
      .addCase(actions.setIsLostFoundChangedAction, field("isLostFoundChanged"))
      .addCase(actions.setIsLostFoundChangeCoverAction, field("isLostFoundChangeCover"))
      .addCase(actions.setIsLostFoundChangedCoverAction, field("isLostFoundChangedCover"))
      .addCase(actions.setIsLostFoundDeleteAction, field("isLostFoundDelete"))
      .addCase(actions.setIsLostFoundDeletedAction, field("isLostFoundDeleted"))
      .addCase(actions.setLostFoundStatsAction, field("lostFoundStats"))
      .addCase(actions.resetLostFoundFlagsAction, (state) => {
        state.isLostFoundAdded = false;
        state.isLostFoundChanged = false;
        state.isLostFoundChangedCover = false;
        state.isLostFoundDeleted = false;
      });
  },
});

export default lostFoundSlice.reducer;
