import * as types from "./types";

export const close = () => ({
  type: types.CLOSE
});

export const getEventReq = () => ({
  type: types.GET_EVENT_REQ
});

export const getEventFail = (error) => ({
  type: types.GET_EVENT_FAIL,
  payload: { error }
});

export const getEventSuccess = (event) => ({
  type: types.GET_EVENT_SUCCESS,
  payload: { event }
});

export const claimReq = () => ({
  type: types.CLAIM_REQ
});

export const claimFail = () => ({
  type: types.CLAIM_FAIL
});

export const claimSuccess = (event) => ({
  type: types.CLAIM_SUCCESS,
  payload: { event }
});


export const addSelectionReq = () => ({
  type: types.ADD_SELECTION_REQ
});

export const addSelectionFail = (error) => ({
  type: types.ADD_SELECTION_FAIL,
  payload: { error }
});

export const addSelectionSuccess = () => ({
  type: types.ADD_SELECTION_SUCCESS
});

export const clearSelectionError = () => ({
  type: types.CLEAR_SELECTION_ERROR
});
