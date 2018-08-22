import * as types from "./types";

export const cancel = () => ({
  type: types.CANCEL
});

export const nextStep = () => ({
  type: types.NEXT_STEP
});

export const previousStep = () => ({
  type: types.PREVIOUS_STEP
});

export const setTitle = (title) => ({
  type: types.SET_TITLE,
  payload: { title }
});

export const setDays = (days) => ({
  type: types.SET_DAYS,
  payload: { days }
});

export const updateDays = (days) => ({
  type: types.UPDATE_DAYS,
  payload: { days }
});

export const updatePassword = (password) => ({
  type: types.UPDATE_PASSWORD,
  payload: { password }
});

export const updateExpirationDate = (expirationDate) => ({
  type: types.UPDATE_EXPIRATION_DATE,
  payload: { expirationDate }
});

export const updateExpirationDateEnabled = (expirationDateEnabled) => ({
  type: types.UPDATE_EXPIRATION_DATE_ENABLED,
  payload: { expirationDateEnabled }
});

export const resetDaysConfig = (days) => ({
  type: types.RESET_DAYS_CONFIG,
  payload: { days }
});

export const resetExtraConfig = () => ({
  type: types.RESET_EXTRA_CONFIG
});
