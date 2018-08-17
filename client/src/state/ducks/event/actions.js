import * as types from "./types";

export const cancel = () => ({
  type: types.CANCEL
});

export const setTitle = (title) => ({
  type: types.SET_TITLE,
  payload: { title }
});
