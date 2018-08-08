import * as types from "./types";

/** State shape
 * {
 *  mode: string,
 *  opened: boolean,
 *  email: string
 *  password: string
 *  loading: boolean,
 *  fail: boolean
 *  recoveryPasswordSent: boolean,
 * }
 */

let initialState = {
  mode: types.MODE_LOGIN
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.OPEN:
      return { ...state, opened: true };

    case types.CLOSE:
    case types.LOGIN_SUCCESS:
      return initialState;

    case types.CHANGE_MODE:
      return {
        opened: true,
        mode: action.payload.mode,
      };

    case types.LOGIN_REQ:
    case types.PASS_RECOVERY_REQ:
      return { ...state, loading: true };

    case types.PASS_RECOVERY_SUCCESS:
      return {
        ...state,
        loading: false,
        fail: false,
        recoveryPasswordSent: true
      };

    case types.LOGIN_FAIL:
    case types.PASS_RECOVERY_FAIL:
      return {
        ...state,
        loading: false,
        fail: true
      };

    case types.BAD_REQUEST:
      return {
        ...state,
        fail: true
      };

    default:
      return state;
  }
};

export default reducer;
