import * as types from "./types";

/** State shape
 * {
 *  email: string,
 *  loading: boolean,
 *  success: boolean,
 *  error: object
 * }
 */

const reducer = (state = {}, action) => {
  switch (action.type) {
    case types.CLOSE:
      return {};

    case types.IS_VALID_TOKEN:
    case types.CHANGE_PASS_REQ:
      return { ...state, loading: true };

    case types.INVALID_TOKEN:
    case types.CHANGE_PASS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case types.VALID_TOKEN:
      return {
        ...state,
        email: action.payload.email,
        loading: false,
        error: null
      };

    case types.CHANGE_PASS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: true
      };

    case types.CLEAN_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default reducer;
