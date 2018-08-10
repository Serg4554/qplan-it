import * as types from "./types";
import {SIGN_UP_SUCCESS} from "./types";

/** State shape
 * {
 *  mode: string,
 *  opened: boolean,
 *  loading: boolean,
 *  fail: boolean
 *  recoveryPasswordSent: boolean,
 *  signUpSuccess: boolean,
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
        fail: false,
        mode: action.payload.mode
      };

    case types.LOGIN_REQ:
    case types.SIGN_UP_REQ:
    case types.PASS_RECOVERY_REQ:
    case types.IS_VALID_TOKEN:
    case types.CHANGE_PASSWORD_REQ:
      return { ...state, loading: true };

    case types.PASS_RECOVERY_SUCCESS:
      return {
        ...state,
        loading: false,
        fail: false,
        recoveryPasswordSent: true
      };

    case types.LOGIN_FAIL:
    case types.SIGN_UP_FAIL:
    case types.PASS_RECOVERY_FAIL:
    case types.INVALID_TOKEN:
    case types.CHANGE_PASSWORD_FAIL:
      return {
        ...state,
        loading: false,
        fail: true
      };

    case SIGN_UP_SUCCESS:
      return {
        ...state,
        loading: false,
        fail: false,
        signUpSuccess: true
      };

    case types.VALID_TOKEN:
    case types.CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        fail: false,
      };

    case types.BAD_REQUEST:
      return {
        ...state,
        fail: true
      };

    case types.GOOD_REQUEST:
      return {
        ...state,
        fail: false
      };

    default:
      return state;
  }
};

export default reducer;
