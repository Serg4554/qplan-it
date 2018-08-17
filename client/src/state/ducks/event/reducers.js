import * as types from "./types";

/** State shape
 * {
 *  step: number,
 *  title: string,
 *  days: Date[],
 * }
 */

const reducer = (state = {}, action) => {
  switch (action.type) {
    case types.CANCEL:
      return {};

    case types.NEXT_STEP:
      return {
        ...state,
        step: (state.step || 0) < 2 ? (state.step || 0) + 1 : 2
      };

    case types.PREVIOUS_STEP:
      return {
        ...state,
        step: state.step && state.step > 0 ? state.step - 1 : 0
      };

    case types.SET_TITLE:
      return {
        ...state,
        title: action.payload.title
      };

    case types.SET_DAYS:
      return {
        ...state,
        days: action.payload.days
      };

    default:
      return state;
  }
};

export default reducer;
