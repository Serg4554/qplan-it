import * as types from "./types";

export const close = () => ({
  type: types.CLOSE
});

export const cleanError = () => ({
  type: types.CLEAN_ERROR
});

export const isValidToken = () => ({
  type: types.IS_VALID_TOKEN
});

export const validToken = (email) => ({
  type: types.VALID_TOKEN,
  payload: { email }
});

export const invalidToken = (error) => ({
  type: types.INVALID_TOKEN,
  payload: { error }
});

export const changePasswordReq = () => ({
  type: types.CHANGE_PASS_REQ
});

export const changePasswordSuccess = () => ({
  type: types.CHANGE_PASS_SUCCESS
});

export const changePasswordFail = (error) => ({
  type: types.CHANGE_PASS_FAIL,
  payload: { error }
});
