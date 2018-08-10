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

export const goodRequest = () => ({
  type: types.GOOD_REQUEST
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

export const signUpReq = () => ({
  type: types.SIGN_UP_REQ
});

export const signUpSuccess = () => ({
  type: types.SIGN_UP_SUCCESS
});

export const signUpFail = () => ({
  type: types.SIGN_UP_FAIL
});

export const isValidToken = () => ({
  type: types.IS_VALID_TOKEN
});

export const validToken = () => ({
  type: types.VALID_TOKEN
});

export const invalidToken = () => ({
  type: types.INVALID_TOKEN
});

export const changePasswordReq = () => ({
  type: types.CHANGE_PASSWORD_REQ
});

export const changePasswordSuccess = () => ({
  type: types.CHANGE_PASSWORD_SUCCESS
});

export const changePasswordFail = () => ({
  type: types.CHANGE_PASSWORD_FAIL
});
