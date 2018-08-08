import * as types from "./types";

export const setUser = (user) => ({
  type: types.SET_USER,
  payload: { user }
});

export const unsetUser = () => ({
  type: types.UNSET_USER
});
