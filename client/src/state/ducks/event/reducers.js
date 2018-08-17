import * as types from "./types";

/** State shape
 * {
 *  title: string,
 * }
 */

const reducer = (state = {}, action) => {
  switch (action.type) {
    case types.CANCEL:
      return {};

    case types.SET_TITLE:
      return {
        ...state,
        title: action.payload.title
      };

    default:
      return state;
  }
};

export default reducer;
