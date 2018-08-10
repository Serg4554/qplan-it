import * as types from "./types";

/** State shape
 * {
 *  mode: string,
 *  opened: boolean,
 *  loading: boolean,
 *  error: object
 *  recoveryPasswordSent: boolean,
 *  signUpSuccess: boolean
 * }
 */

const reducer = (state = {}, action) => {
  switch (action.type) {
    case types.OPEN:
      return {
        mode: types.MODE_LOGIN,
        opened: true
      };

    case types.CLOSE:
    case types.LOGIN_SUCCESS:
      return {};

    case types.CHANGE_MODE:
      return {
        ...state,
        loading: false,
        error: null,
        mode: action.payload.mode
      };

    case types.LOGIN_REQ:
    case types.SIGN_UP_REQ:
    case types.PASS_RECOVERY_REQ:
      return { ...state, loading: true };

    case types.PASS_RECOVERY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        recoveryPasswordSent: true
      };

    case types.LOGIN_FAIL:
    case types.SIGN_UP_FAIL:
    case types.PASS_RECOVERY_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case types.SIGN_UP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        signUpSuccess: true
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
