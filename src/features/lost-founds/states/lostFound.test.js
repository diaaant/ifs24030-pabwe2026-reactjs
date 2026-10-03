import { describe, it, expect, vi, beforeEach } from "vitest";
import reducer, { initialLostFoundState } from "./lostFoundSlice";
import * as actions from "./lostFoundActions";
import * as types from "./lostFoundActionTypes";
import * as thunks from "./lostFoundThunks";
import lostFoundApi from "../api/lostFoundApi";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    getLostFound: vi.fn(),
    addLostFound: vi.fn(),
    changeLostFound: vi.fn(),
    changeCover: vi.fn(),
    deleteLostFound: vi.fn(),
    getStatsDaily: vi.fn(),
    getStatsMonthly: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("lostFound reducer", () => {
  it("menangani seluruh action", () => {
    let state = reducer(undefined, { type: "@@init" });
    expect(state).toEqual(initialLostFoundState);
    expect(actions.setLostFoundsAction([]).type).toBe(types.LOST_FOUNDS_SET);

    state = reducer(state, actions.setLostFoundsAction([{ id: 1 }]));
    state = reducer(state, actions.setLostFoundAction({ id: 2 }));
    expect(state.lostFounds).toEqual([{ id: 1 }]);
    expect(state.lostFound).toEqual({ id: 2 });
    expect(state.isLostFound).toBe(true);

    state = reducer(state, actions.clearLostFoundAction());
    expect(state.lostFound).toBeNull();
    expect(state.isLostFound).toBe(false);

    state = reducer(state, actions.setIsLostFoundAddAction(true));
    state = reducer(state, actions.setIsLostFoundAddedAction(true));
    state = reducer(state, actions.setIsLostFoundChangeAction(true));
    state = reducer(state, actions.setIsLostFoundChangedAction(true));
    state = reducer(state, actions.setIsLostFoundChangeCoverAction(true));
    state = reducer(state, actions.setIsLostFoundChangedCoverAction(true));
    state = reducer(state, actions.setIsLostFoundDeleteAction(true));
    state = reducer(state, actions.setIsLostFoundDeletedAction(true));
    state = reducer(state, actions.setLostFoundStatsAction({ daily: {}, monthly: {} }));
    expect(state).toMatchObject({
      isLostFoundAdd: true,
      isLostFoundAdded: true,
      isLostFoundChange: true,
      isLostFoundChanged: true,
      isLostFoundChangeCover: true,
      isLostFoundChangedCover: true,
      isLostFoundDelete: true,
      isLostFoundDeleted: true,
      lostFoundStats: { daily: {}, monthly: {} },
    });

    state = reducer(state, actions.resetLostFoundFlagsAction());
    expect(state).toMatchObject({
      isLostFoundAdded: false,
      isLostFoundChanged: false,
      isLostFoundChangedCover: false,
      isLostFoundDeleted: false,
      isLostFoundAdd: true, // flag proses tidak ikut direset
    });
  });
});

describe("lostFound thunks", () => {
  const dispatch = vi.fn();
  beforeEach(() => vi.clearAllMocks());

  it("asyncGetLostFounds berhasil & gagal", async () => {
    lostFoundApi.getLostFounds.mockResolvedValueOnce([{ id: 1 }]);
    await thunks.asyncGetLostFounds({ status: "lost" })(dispatch);
    expect(lostFoundApi.getLostFounds).toHaveBeenCalledWith({ status: "lost" });
    expect(dispatch).toHaveBeenCalledWith(actions.setLostFoundsAction([{ id: 1 }]));
    lostFoundApi.getLostFounds.mockRejectedValueOnce(new Error("e"));
    await thunks.asyncGetLostFounds()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setLostFoundsAction([]));
    expect(showErrorDialog).toHaveBeenCalledWith("e");
  });

  it("asyncGetLostFound berhasil & gagal", async () => {
    lostFoundApi.getLostFound.mockResolvedValueOnce({ id: 1 });
    await thunks.asyncGetLostFound(1)(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setLostFoundAction({ id: 1 }));
    lostFoundApi.getLostFound.mockRejectedValueOnce(new Error("e"));
    await thunks.asyncGetLostFound(1)(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setLostFoundAction(null));
  });

  it("asyncAddLostFound berhasil & gagal", async () => {
    lostFoundApi.addLostFound.mockResolvedValueOnce(1);
    await thunks.asyncAddLostFound({})(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setIsLostFoundAddedAction(true));
    expect(dispatch).toHaveBeenLastCalledWith(actions.setIsLostFoundAddAction(false));
    expect(showSuccessDialog).toHaveBeenCalled();
    lostFoundApi.addLostFound.mockRejectedValueOnce(new Error("tambah"));
    await thunks.asyncAddLostFound({})(dispatch);
    expect(showErrorDialog).toHaveBeenCalledWith("tambah");
  });

  it("asyncChangeLostFound berhasil & gagal", async () => {
    lostFoundApi.changeLostFound.mockResolvedValueOnce({});
    await thunks.asyncChangeLostFound(1, {})(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setIsLostFoundChangedAction(true));
    lostFoundApi.changeLostFound.mockRejectedValueOnce(new Error("ubah"));
    await thunks.asyncChangeLostFound(1, {})(dispatch);
    expect(showErrorDialog).toHaveBeenCalledWith("ubah");
  });

  it("asyncChangeCover berhasil & gagal", async () => {
    lostFoundApi.changeCover.mockResolvedValueOnce({});
    await thunks.asyncChangeCover(1, "f")(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setIsLostFoundChangedCoverAction(true));
    lostFoundApi.changeCover.mockRejectedValueOnce(new Error("cover"));
    await thunks.asyncChangeCover(1, "f")(dispatch);
    expect(showErrorDialog).toHaveBeenCalledWith("cover");
  });

  it("asyncDeleteLostFound: dibatalkan, berhasil, gagal", async () => {
    showConfirmDialog.mockResolvedValueOnce(false);
    await thunks.asyncDeleteLostFound(1)(dispatch);
    expect(lostFoundApi.deleteLostFound).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();

    showConfirmDialog.mockResolvedValue(true);
    lostFoundApi.deleteLostFound.mockResolvedValueOnce({});
    await thunks.asyncDeleteLostFound(1)(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.setIsLostFoundDeletedAction(true));

    lostFoundApi.deleteLostFound.mockRejectedValueOnce(new Error("hapus"));
    await thunks.asyncDeleteLostFound(1)(dispatch);
    expect(showErrorDialog).toHaveBeenCalledWith("hapus");
  });

  it("asyncGetStats berhasil & gagal", async () => {
    lostFoundApi.getStatsDaily.mockResolvedValueOnce({ d: 1 });
    lostFoundApi.getStatsMonthly.mockResolvedValueOnce({ m: 1 });
    await thunks.asyncGetStats()(dispatch);
    expect(lostFoundApi.getStatsDaily).toHaveBeenCalledWith(7);
    expect(lostFoundApi.getStatsMonthly).toHaveBeenCalledWith(6);
    expect(dispatch).toHaveBeenCalledWith(
      actions.setLostFoundStatsAction({ daily: { d: 1 }, monthly: { m: 1 } }),
    );
    lostFoundApi.getStatsDaily.mockRejectedValueOnce(new Error("stat"));
    lostFoundApi.getStatsMonthly.mockResolvedValueOnce({});
    await thunks.asyncGetStats()(dispatch);
    expect(showErrorDialog).toHaveBeenCalledWith("stat");
  });
});
