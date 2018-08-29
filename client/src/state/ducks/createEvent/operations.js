import * as actions from "./actions"
import apiService from "../../apiService";
import * as session from "../session/operations";

const cancel = actions.cancel;

const nextStep = actions.nextStep;

const previousStep = actions.previousStep;

const setTitle = actions.setTitle;

const setDays = actions.setDays;

const updateDays = actions.updateDays;

const setSelectedDates = actions.setSelectedDates;

const updatePassword = actions.updatePassword;

const updateExpirationDate = actions.updateExpirationDate;

const updateExpirationDateEnabled = actions.updateExpirationDateEnabled;

const resetDaysConfig = actions.resetDaysConfig;

const resetExtraConfig = actions.resetExtraConfig;

const create = (title, days, password, expiration, owner) => dispatch => {
  dispatch(actions.createReq());

  return apiService.Event.create(title, days, password, expiration, owner)
    .then(res => {
      if(res.error) {
        return dispatch(actions.createFail())
      }

      dispatch(session.addClaimToken({event: res.id, secret: res._claimToken}));
      return dispatch(actions.createSuccess(res.id));
    });
};

export {
  cancel,
  nextStep,
  previousStep,
  setTitle,
  setDays,
  updateDays,
  setSelectedDates,
  updatePassword,
  updateExpirationDate,
  updateExpirationDateEnabled,
  resetDaysConfig,
  resetExtraConfig,
  create
}
