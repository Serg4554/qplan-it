import * as actions from "./actions"
import apiService from "../../apiService";

const setUser = (user) => dispatch => {
  window.localStorage.setItem('usr', JSON.stringify(user));
  return dispatch(actions.setUser(user));
};

const unsetUser = actions.unsetUser;

const addClaimToken = (claimToken) => dispatch => {
  let claimTokens = [];
  try {
    claimTokens = JSON.parse(window.localStorage.getItem('claimTokens'));
  } catch(err) {}
  if(!claimTokens || !(claimTokens instanceof Array)) {
    claimTokens = [];
  }

  claimTokens.push(claimToken);
  window.localStorage.setItem('claimTokens', JSON.stringify(claimTokens));

  return dispatch(actions.addClaimToken(claimToken));
};

const removeClaimToken = (claimToken) => dispatch => {
  let claimTokens = [];
  try {
    claimTokens = JSON.parse(window.localStorage.getItem('claimTokens'));
  } catch(err) {}
  if(!claimTokens || !(claimTokens instanceof Array)) {
    claimTokens = [];
  }

  if(claimTokens.length !== 0) {
    let index = claimTokens.findIndex(ct => ct.event === claimTokens.event);
    if(index !== -1) {
      claimTokens.splice(index, 1);
    }
  }
  window.localStorage.setItem('claimTokens', JSON.stringify(claimTokens));

  return dispatch(actions.removeClaimToken(claimToken));
};

const addParticipation = (participation) => dispatch => {
  let participations = [];
  try {
    participations = JSON.parse(window.localStorage.getItem('participations'));
  } catch(err) {}
  if(!participations || !(participations instanceof Array)) {
    participations = [];
  }

  participations.push(participation);

  window.localStorage.setItem('participations', JSON.stringify(participations));

  return dispatch(actions.addParticipation(participation));
};

const removeParticipation = (participation) => dispatch => {
  let participations = [];
  try {
    participations = JSON.parse(window.localStorage.getItem('participations'));
  } catch(err) {}
  if(!participations || !(participations instanceof Array)) {
    participations = [];
  }

  let index = participations.findIndex(p => p.id === participation.id);
  if(index !== -1) {
    participations.splice(index, 1);
  }

  window.localStorage.setItem('participations', JSON.stringify(participations));

  return dispatch(actions.removeParticipation(participation));
};

const setAnonymousUser = (anonymousUser) => dispatch => {
  if(anonymousUser.name) {
    window.localStorage.setItem('anonymousUser', JSON.stringify(anonymousUser));
    dispatch(actions.setAnonymousUser(anonymousUser));
  }
};

const retrieveSession = () => dispatch => {
  const token = window.localStorage.getItem('jwt');
  let user;
  try {
    user = JSON.parse(window.localStorage.getItem('usr'))
  } catch (e) {
    user = null;
  }

  if(token && user) {
    apiService.setToken(token);
    dispatch(actions.setUser(user));

    apiService.Auth.getUser(user.id)
      .then(res => {
        if(res.error) {
          window.localStorage.setItem('usr', '');
          window.localStorage.setItem('jwt', '');
        } else if(JSON.stringify(user) !== JSON.stringify(res)) {
          window.localStorage.setItem('usr', JSON.stringify(res));
          dispatch(actions.setUser(res));
        }
      });
  }

  let claimTokens = [];
  try {
    claimTokens = JSON.parse(window.localStorage.getItem('claimTokens'));
  } catch(err) {}
  if(!claimTokens || !(claimTokens instanceof Array)) {
    claimTokens = [];
  }
  if(claimTokens.length !== 0) {
    dispatch(actions.setClaimTokens(claimTokens));
  }

  let participations = [];
  try {
    participations = JSON.parse(window.localStorage.getItem('participations'));
  } catch(err) {}
  if(!participations || !(participations instanceof Array)) {
    participations = [];
  }
  if(participations.length !== 0) {
    dispatch(actions.setParticipations(participations));
  }

  let anonymousUser = {};
  try {
    anonymousUser = JSON.parse(window.localStorage.getItem('anonymousUser'));
  } catch(err) {}
  if(!anonymousUser || !anonymousUser.name) {
    anonymousUser = {};
  }
  if(anonymousUser.name) {
    dispatch(actions.setAnonymousUser(anonymousUser));
  }
};

export {
  setUser,
  unsetUser,
  addClaimToken,
  removeClaimToken,
  addParticipation,
  removeParticipation,
  setAnonymousUser,
  retrieveSession
}
