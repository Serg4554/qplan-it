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

export const claimReqSuccess = (event) => ({
  type: types.CLAIM_SUCCESS,
  payload: { event }
});
