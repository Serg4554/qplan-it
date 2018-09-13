import * as types from "./types";

/** State shape
 * {
 *  loading: bool,
 *  claiming: bool,
 *  error: object,
 *  selectionError: bool,
 *  id: string,
 *  title: string,
 *  creation: Date,
 *  expiration: Date,
 *  ownerId: string,
 *  days: Day[]
 * }
 */

/** Day shape
 * {
 *  period: Period,
 *  blockedPeriods: Period[]
 * }
 */

/** Period shape
 * {
 *  start: Date,
 *  duration: number,
 * }
 */

const reducer = (state = {}, action) => {
  switch (action.type) {
    case types.CLOSE:
      return {};

    case types.GET_EVENT_REQ:
      return { ...state, loading: true, error: undefined };

    case types.GET_EVENT_FAIL:
      return { ...state, loading: false, error: action.payload.error };

    case types.GET_EVENT_SUCCESS:
      return { ...state, loading: false, error: undefined, ...action.payload.event };

    case types.CLAIM_REQ:
      return { ...state, claiming: true };

    case types.CLAIM_FAIL:
      return { ...state, claiming: false };

    case types.CLAIM_SUCCESS:
      return {
        ...state,
        claiming: false,
        ...action.payload.event
      };

    case types.ADD_SELECTION_FAIL:
      return {
        ...state,
        selectionError: action.payload.error
      };

    case types.ADD_SELECTION_SUCCESS:
    case types.CLEAR_SELECTION_ERROR:
      return {
        ...state,
        selectionError: undefined
      };

    default:
      return state;
  }
};

export default reducer;
