import * as types from "./types";

/** State shape
 * {
 *  step: number,
 *  title: string,
 *  days: [{
 *    date: Date,
 *    period: Period,
 *    blockedPeriods: [Period]
 *  }]
 * }
 */

/** Period shape
 * {
 *  start: Date,
 *  end: Date,
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

    case types.UPDATE_DAYS:
      const updatedDays = action.payload.days;
      let days = state.days.slice();
      updatedDays.forEach(updatedDay => {
        let index = days.findIndex(d => d.date.getTime() === updatedDay.date.getTime());
        if(index !== -1) {
          days[index].period = updatedDay.period;
          days[index].blockedPeriods = updatedDay.blockedPeriods;
        }
      });
      return({ ...state, days });

    default:
      return state;
  }
};

export default reducer;
