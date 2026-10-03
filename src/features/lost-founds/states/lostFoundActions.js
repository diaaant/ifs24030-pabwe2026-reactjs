import { createAction } from "@reduxjs/toolkit";
import * as types from "./lostFoundActionTypes";

export const setLostFoundsAction = createAction(types.LOST_FOUNDS_SET);
export const setLostFoundAction = createAction(types.LOST_FOUND_SET);
export const clearLostFoundAction = createAction(types.LOST_FOUND_CLEAR);
export const setIsLostFoundAddAction = createAction(types.LOST_FOUND_ADD_SET);
export const setIsLostFoundAddedAction = createAction(types.LOST_FOUND_ADDED_SET);
export const setIsLostFoundChangeAction = createAction(types.LOST_FOUND_CHANGE_SET);
export const setIsLostFoundChangedAction = createAction(types.LOST_FOUND_CHANGED_SET);
export const setIsLostFoundChangeCoverAction = createAction(
  types.LOST_FOUND_CHANGE_COVER_SET,
);
export const setIsLostFoundChangedCoverAction = createAction(
  types.LOST_FOUND_CHANGED_COVER_SET,
);
export const setIsLostFoundDeleteAction = createAction(types.LOST_FOUND_DELETE_SET);
export const setIsLostFoundDeletedAction = createAction(types.LOST_FOUND_DELETED_SET);
export const setLostFoundStatsAction = createAction(types.LOST_FOUND_STATS_SET);
export const resetLostFoundFlagsAction = createAction(types.LOST_FOUND_RESET_FLAGS);
