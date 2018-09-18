import * as types from "./types";

/** State shape
 * {
 *  user: object,
 *  anonymousUser: object,
 *  claimTokens: [{
 *      event: string,
 *      secret: string
 *  }],
 *  participations: [{
 *      id: string,
 *      eventId: string,
 *      participationToken: string
 *  }]
 * }
 */

let initialState = {

};

/** @namespace state.claimTokens */
/** @namespace state.participations */
const reducer = (state = initialState, action) => {
  let claimTokens, participations, index;

  switch (action.type) {
    case types.SET_USER:
      return {
        ...state,
        user: action.payload.user
      };

    case types.UNSET_USER:
      delete state.user;
      return state;

    case types.SET_CLAIM_TOKENS:
      return {
        ...state,
        claimTokens: action.payload.claimTokens
      };

    case types.ADD_CLAIM_TOKEN:
      claimTokens = (state.claimTokens || []).slice();
      claimTokens.push(action.payload.claimToken);
      return { ...state, claimTokens };

    case types.REMOVE_CLAIM_TOKEN:
      claimTokens = (state.claimTokens || []).slice();
      index = claimTokens.findIndex(ct => ct.event === action.payload.claimToken.event);
      if(index !== -1) {
        claimTokens.splice(index, 1);
      }
      return { ...state, claimTokens };

    case types.SET_PARTICIPATIONS:
      return {
        ...state,
        participations: action.payload.participations
      };

    case types.ADD_PARTICIPATION:
      participations = (state.participations || []).slice();
      participations.push(action.payload.participation);
      return { ...state, participations };

    case types.REMOVE_PARTICIPATION:
      participations = (state.participations || []).slice();
      index = participations.findIndex(p => p.id === action.payload.participation.id);
      if(index !== -1) {
        participations.splice(index, 1);
      }
      return { ...state, participations };

    case types.SET_ANONYMOUS_USER:
      return { ...state, anonymousUser: action.payload.anonymousUser };

    default:
      return state;
  }
};

export default reducer;
