import lostFoundApi from "../api/lostFoundApi";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import * as actions from "./lostFoundActions";

export const asyncGetLostFounds = (filters) => async (dispatch) => {
  try {
    dispatch(actions.setLostFoundsAction(await lostFoundApi.getLostFounds(filters)));
  } catch (error) {
    dispatch(actions.setLostFoundsAction([]));
    await showErrorDialog(error.message);
  }
};

export const asyncGetLostFound = (id) => async (dispatch) => {
  try {
    dispatch(actions.setLostFoundAction(await lostFoundApi.getLostFound(id)));
  } catch (error) {
    dispatch(actions.setLostFoundAction(null));
    await showErrorDialog(error.message);
  }
};

export const asyncAddLostFound = (payload) => async (dispatch) => {
  dispatch(actions.setIsLostFoundAddAction(true));
  try {
    await lostFoundApi.addLostFound(payload);
    dispatch(actions.setIsLostFoundAddedAction(true));
    await showSuccessDialog("Laporan berhasil ditambahkan.");
  } catch (error) {
    await showErrorDialog(error.message);
  }
  dispatch(actions.setIsLostFoundAddAction(false));
};

export const asyncChangeLostFound = (id, payload) => async (dispatch) => {
  dispatch(actions.setIsLostFoundChangeAction(true));
  try {
    await lostFoundApi.changeLostFound(id, payload);
    dispatch(actions.setIsLostFoundChangedAction(true));
    await showSuccessDialog("Laporan berhasil diperbarui.");
  } catch (error) {
    await showErrorDialog(error.message);
  }
  dispatch(actions.setIsLostFoundChangeAction(false));
};

export const asyncChangeCover = (id, file) => async (dispatch) => {
  dispatch(actions.setIsLostFoundChangeCoverAction(true));
  try {
    await lostFoundApi.changeCover(id, file);
    dispatch(actions.setIsLostFoundChangedCoverAction(true));
    await showSuccessDialog("Cover berhasil diperbarui.");
  } catch (error) {
    await showErrorDialog(error.message);
  }
  dispatch(actions.setIsLostFoundChangeCoverAction(false));
};

export const asyncDeleteLostFound = (id) => async (dispatch) => {
  const confirmed = await showConfirmDialog("Laporan yang dihapus tidak dapat dikembalikan.");
  if (!confirmed) return;
  dispatch(actions.setIsLostFoundDeleteAction(true));
  try {
    await lostFoundApi.deleteLostFound(id);
    dispatch(actions.setIsLostFoundDeletedAction(true));
    await showSuccessDialog("Laporan berhasil dihapus.");
  } catch (error) {
    await showErrorDialog(error.message);
  }
  dispatch(actions.setIsLostFoundDeleteAction(false));
};

export const asyncGetStats = () => async (dispatch) => {
  try {
    const [daily, monthly] = await Promise.all([
      lostFoundApi.getStatsDaily(7),
      lostFoundApi.getStatsMonthly(6),
    ]);
    dispatch(actions.setLostFoundStatsAction({ daily, monthly }));
  } catch (error) {
    await showErrorDialog(error.message);
  }
};
