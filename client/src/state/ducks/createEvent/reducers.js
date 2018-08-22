import * as types from "./types";
import moment from "moment";

/** State shape
 * {
 *  step: number,
 *  title: string,
 *  days: [{
 *    date: Date,
 *    period: Period,
 *    blockedPeriods: [Period]
 *  }],
 *  password: string,
 *  expirationDateEnabled: bool,
 *  expirationDate: Date
 * }
 */

/** Period shape
 * {
 *  start: Date,
 *  end: Date,
 * }
 */

const defaultPeriod = {
  start: moment().startOf('day').hours(8).toDate(),
  end: moment().startOf('day').hours(22).toDate()
};

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
        if(!day.period) day.period = defaultPeriod;
        if(!day.blockedPeriods) day.blockedPeriods = [];
      });
      return { ...state, days };

    case types.UPDATE_DAYS:
      const updatedDays = action.payload.days;
      days = state.days.slice();
      updatedDays.forEach(updatedDay => {
        let index = days.findIndex(d => d.date.getTime() === updatedDay.date.getTime());
        if(index !== -1) {
          days[index].period = updatedDay.period;
          days[index].blockedPeriods = updatedDay.blockedPeriods;
        }
      });
      return({ ...state, days });

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
      let resetDayTimes = action.payload.days.map(d => d.date.getTime());
      days.forEach(day => {
        if(resetDayTimes.includes(day.date.getTime())) {
          day.period = defaultPeriod;
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
