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

const addSelections = (id, selections) => async (dispatch, getState) => {
  dispatch(actions.addSelectionReq());

  const sessionState = getState().session;
  if(!sessionState.anonymousUser && !sessionState.user) {
    return  dispatch(actions.addSelectionFail({ message: "Invalid user" }));
  }

  let participation;
  if(sessionState.user) {
    participation = sessionState.participations ?
      sessionState.participations.find(p => p.eventId === id && p.ownerId === sessionState.user.id) :
      undefined;
    if(!participation) {
      await apiService.Event.getUserParticipation(id, sessionState.user.id)
        .then(response => {
          if(response.length > 0) {
            participation = response[0];
            dispatch(session.addParticipation(participation));
          }
        });
    }
  }
  if(!participation) {
    participation = sessionState.participations ? sessionState.participations.find(p => p.eventId === id) : undefined;
  }

  let selectionsSent = false;
  if(!participation) {
    const {name, surname} = sessionState.anonymousUser || {};
    await apiService.Event.addParticipation(id, name, surname, selections)
      .then(response => {
        if(response.error) {
          dispatch(actions.addSelectionFail(response.error))
        }
        selectionsSent = true;
        participation = response;
        dispatch(session.addParticipation(response));
      });
    if(!participation) return;
  }

  if(!selectionsSent) {
    let success = true;
    const handleResponse = response => {
      if(response.error) {
        dispatch(actions.addSelectionFail(response.error));
        success = false;
      }
    };
    for(let i = 0; i < selections.length; i++) {
      await apiService.Event.addSelection(id, participation.id, selections[i].period, participation._participationToken)
        .then(handleResponse);
      if(!success) break;
    }
    if(success) {
      dispatch(actions.addSelectionSuccess());
    }
  }
};

const clearSelectionError = actions.clearSelectionError;

export {
  close,
  getEvent,
  claim,
  addSelections,
  clearSelectionError
}
