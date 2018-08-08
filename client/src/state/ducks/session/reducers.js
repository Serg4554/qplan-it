import * as types from "./types";

/** State shape
 * {
 *  user: object
 * }
 */

let initialState = {

};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_USER:
      return {
        ...state,
        user: action.payload.user
      };

    case types.UNSET_USER:
      delete state.user;
      return state;

    default:
      return state;
  }
};

export default reducer;
