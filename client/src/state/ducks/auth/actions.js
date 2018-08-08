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

export const loginFail = () => ({
  type: types.LOGIN_FAIL
});

export const badRequest = () => ({
  type: types.BAD_REQUEST
});

export const passRecoveryReq = () => ({
  type: types.PASS_RECOVERY_REQ
});

export const passRecoverySuccess = () => ({
  type: types.PASS_RECOVERY_SUCCESS
});

export const passRecoveryFail = () => ({
  type: types.PASS_RECOVERY_FAIL
});
