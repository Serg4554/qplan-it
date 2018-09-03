import * as actions from "./actions"
import apiService from "../../apiService";
import * as session from "../session/operations";

const close = actions.close;

const getEvent = (id) => dispatch => {
  dispatch(actions.getEventReq());

  return apiService.Event.get(id)
    .then(res => {
      if(res.error) {
        return dispatch(actions.getEventFail(res.error))
      }
      return dispatch(actions.getEventSuccess(res));
    });
};

const claim = (id, claimToken) => dispatch =>{
  dispatch(actions.claimReq());

  return apiService.Event.claim(id, claimToken)
    .then(event => {
      if(event.error) {
        return dispatch(actions.claimFail())
      }

      dispatch(session.removeClaimToken({event: event.id, secret: claimToken}));
      return dispatch(actions.claimReqSuccess(event));
    });
};

export {
  close,
  getEvent,
  claim
}
