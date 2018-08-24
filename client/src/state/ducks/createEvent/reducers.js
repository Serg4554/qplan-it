import * as types from "./types";

/** State shape
 * {
 *  step: number,
 *  title: string,
 *  days: [{
 *    period: Period,
 *    blockedPeriods: [Period]
 *  }],
 *  selectedDates: [Date]
 *  password: string,
 *  expirationDateEnabled: bool,
 *  expirationDate: Date
 * }
 */

/** Period shape
 * {
 *  start: Date,
 *  duration: number,
 * }
 */

const reducer = (state = {}, action) => {
  let days;

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
      days = action.payload.days.slice();
      days.forEach(day => {
        if(!day.period.duration) day.period.duration = 0;
        if(!day.blockedPeriods) day.blockedPeriods = [];
      });
      return { ...state, days };

    case types.UPDATE_DAYS:
      const updatedDays = action.payload.days;
      days = state.days.slice();
      updatedDays.forEach(updatedDay => {
        let index = days.findIndex(d => d.period.start.getTime() === updatedDay.period.start.getTime());
        if(index !== -1) {
          days[index].period.duration = updatedDay.period.duration || 0;
          days[index].blockedPeriods = updatedDay.blockedPeriods;
        }
      });
      return({ ...state, days });

    case types.SET_SELECTED_DATES:
      return {
        ...state,
        selectedDates: action.payload.selectedDates
      };

    case types.UPDATE_PASSWORD:
      return {
        ...state,
        password: action.payload.password
      };

    case types.UPDATE_EXPIRATION_DATE:
      return {
        ...state,
        expirationDate: action.payload.expirationDate
      };

    case types.UPDATE_EXPIRATION_DATE_ENABLED:
      return {
        ...state,
        expirationDateEnabled: action.payload.expirationDateEnabled
      };

    case types.RESET_DAYS_CONFIG:
      days = state.days.slice();
      let resetDayTimes = action.payload.days.map(d => d.period.start.getTime());
      days.forEach(day => {
        if(resetDayTimes.includes(day.period.start.getTime())) {
          day.period.duration = 0;
          day.blockedPeriods = [];
        }
      });
      return { ...state, days };

    case types.RESET_EXTRA_CONFIG:
      return {
        ...state,
        password: "",
        expirationDateEnabled: false,
        expirationDate: undefined,
      };

    default:
      return state;
  }
};

export default reducer;
