import * as types from "./types";

export const setUser = (user) => ({
  type: types.SET_USER,
  payload: { user }
});

export const unsetUser = () => ({
  type: types.UNSET_USER
});

export const setClaimTokens = (claimTokens) => ({
  type: types.SET_CLAIM_TOKENS,
  payload: { claimTokens }
});

export const addClaimToken = (claimToken) => ({
  type: types.ADD_CLAIM_TOKEN,
  payload: { claimToken }
});

export const removeClaimToken = (claimToken) => ({
  type: types.REMOVE_CLAIM_TOKEN,
  payload: { claimToken }
});

export const setParticipations = (participations) => ({
  type: types.SET_PARTICIPATIONS,
  payload: { participations }
});

export const addParticipation = (participation) => ({
  type: types.ADD_PARTICIPATION,
  payload: { participation }
});

export const removeParticipation = (participation) => ({
  type: types.REMOVE_PARTICIPATION,
  payload: { participation }
});

export const setAnonymousUser = (anonymousUser) => ({
  type: types.SET_ANONYMOUS_USER,
  payload: { anonymousUser }
});
