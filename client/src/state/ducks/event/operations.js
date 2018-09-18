import * as actions from "./actions"
import apiService from "../../apiService";
import * as session from "../session/operations";

const close = actions.close;

const getEvent = (id) => dispatch => {
  dispatch(actions.getEventReq());

  return apiService.Event.get(id)
    .then(event => {
      if(event.error) {
        return dispatch(actions.getEventFail(event.error))
      }

      return apiService.Event.getParticipations(id)
        .then(async participations => {
          if(participations.error) {
            return dispatch(actions.getEventFail(participations.error))
          }
          event.participations = participations;
          return dispatch(actions.getEventSuccess(event));
        });
    });
};

const getMyParticipation = (eventId, userId, participationId) => dispatch => {
  if (userId) {
    return apiService.Event.getUserParticipation(eventId, userId)
      .then(response => {
        if (response) {
          return dispatch(actions.updateMyParticipation(response));
        }
      });
  } else if (participationId) {
    return apiService.Event.getParticipation(eventId, participationId)
      .then(response => {
        if (!response) {
          dispatch(session.removeParticipation({id: participationId}));
        } else {
          return dispatch(actions.updateMyParticipation(response));
        }
      });
  } else {
    return new Promise((resolve) => {
      dispatch(actions.updateMyParticipation(undefined));
      resolve();
    })
  }
};

const claim = (id, claimToken) => dispatch => {
  dispatch(actions.claimReq());

  return apiService.Event.claim(id, claimToken)
    .then(event => {
      if(event.error) {
        return dispatch(actions.claimFail())
      }

      dispatch(session.removeClaimToken({event: event.id, secret: claimToken}));
      return dispatch(actions.claimSuccess(event));
    });
};

const setSelections = (eventId, selections, participation, user) => async dispatch => {
  dispatch(actions.setSelectionReq());

  if(!user || (!user.id && !user.name)) {
    return  dispatch(actions.setSelectionFail({ message: "Invalid user" }));
  }

  if(!participation) {
    await apiService.Event.addParticipation(eventId, user.name, user.surname, selections)
      .then(response => {
        if(response.error) {
          dispatch(actions.setSelectionFail(response.error))
        } else {
          if(response._participationToken) {
            dispatch(session.addParticipation({
              id: response.id,
              eventId: response.eventId,
              participationToken: response._participationToken
            }));
          }
          dispatch(actions.updateMyParticipation(response));
        }
      });
  } else {
    await apiService.Event.setSelections(eventId, participation.id, selections, participation.participationToken)
      .then(response => {
        if(response.error) {
          dispatch(actions.setSelectionFail(response.error));
        } else {
          dispatch(actions.setSelectionSuccess(response));
        }
      });
  }
};

const clearSelectionError = actions.clearSelectionError;

export {
  close,
  getEvent,
  getMyParticipation,
  claim,
  setSelections,
  clearSelectionError
}
