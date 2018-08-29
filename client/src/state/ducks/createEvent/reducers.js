import * as types from "./types";
import moment from "moment"

/** State shape
 * {
 *  loading: bool,
 *  id: string,
 *  step: number,
 *  title: string,
 *  days: [{
 *    complete: bool,
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
        if(typeof day.complete === "undefined") day.complete = true;
        if(typeof day.period.duration === "undefined") day.period.duration = 0;
        if(typeof day.blockedPeriods === "undefined") day.blockedPeriods = [];
      });
      return { ...state, days };

    case types.UPDATE_DAYS:
      const updatedDays = action.payload.days;
      days = state.days.slice();
      updatedDays.forEach(updatedDay => {
        let index = days.findIndex(d =>
          moment(d.period.start).startOf('day').isSame(moment(updatedDay.period.start).startOf('day'))
        );
        if(index !== -1) {
          days[index].complete = updatedDay.complete || false;
          days[index].period.start = updatedDay.period.start;
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
          day.complete = true;
          day.period.start = moment(day.period.start).startOf('day').toDate();
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

    case types.CREATE_REQ:
      return {
        ...state,
        loading: true
      };

    case types.CREATE_FAIL:
      return {
        ...state,
        loading: false,
        id: undefined
      };

    case types.CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        id: action.payload.id
      };

    default:
      return state;
  }
};

export default reducer;
