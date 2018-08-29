import * as types from "./types";

/** State shape
 * {
 *  user: object,
 *  claimTokens: [{
 *      event: string,
 *      secret: string
 *  }]
 * }
 */

let initialState = {

};

const reducer = (state = initialState, action) => {
  let claimTokens;

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
      const index = claimTokens.findIndex(ct => ct.event === action.payload.claimToken.event);
      if(index !== -1) {
        claimTokens.splice(index, 1);
      }
      return { ...state, claimTokens };

    default:
      return state;
  }
};

export default reducer;
