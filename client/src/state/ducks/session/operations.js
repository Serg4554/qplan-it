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
};

export {
  setUser,
  unsetUser,
  addClaimToken,
  removeClaimToken,
  retrieveSession
}
