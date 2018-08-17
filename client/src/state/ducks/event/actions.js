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
