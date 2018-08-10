import * as types from "./types";

export const open = () => ({
  type: types.OPEN
});

export const close = () => ({
  type: types.CLOSE
});

export const setMode = (mode) => ({
  type: types.CHANGE_MODE,
  payload: { mode }
});

export const loginReq = () => ({
  type: types.LOGIN_REQ
});

export const loginSuccess = () => ({
  type: types.LOGIN_SUCCESS
});

export const loginFail = (error) => ({
  type: types.LOGIN_FAIL,
  payload: { error }
});

export const cleanError = () => ({
  type: types.CLEAN_ERROR
});

export const passRecoveryReq = () => ({
  type: types.PASS_RECOVERY_REQ
});

export const passRecoverySuccess = () => ({
  type: types.PASS_RECOVERY_SUCCESS
});

export const passRecoveryFail = (error) => ({
  type: types.PASS_RECOVERY_FAIL,
  payload: { error }
});

export const signUpReq = () => ({
  type: types.SIGN_UP_REQ
});

export const signUpSuccess = () => ({
  type: types.SIGN_UP_SUCCESS
});

export const signUpFail = (error) => ({
  type: types.SIGN_UP_FAIL,
  payload: { error }
});
