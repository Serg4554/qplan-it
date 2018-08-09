import * as actions from "./actions"
import * as session from "../session/operations"
import apiService from "../../apiService";

const open = actions.open;

const close = actions.close;

const setMode = actions.setMode;

const login = (email, password) => dispatch => {
  dispatch(actions.loginReq());

  return apiService.Auth.login(email, password)
    .then(loginResponse => {
      if(!loginResponse.id || !loginResponse.userId) {
        return dispatch(actions.loginFail())
      }

      apiService.setToken(loginResponse.id);
      window.localStorage.setItem('jwt', loginResponse.id);

      return apiService.Auth.getUser(loginResponse.userId)
        .then(userResponse => {
          window.localStorage.setItem('usr', JSON.stringify(userResponse));
          dispatch(session.setUser(userResponse));
          return dispatch(actions.loginSuccess());
        });
    })
    .catch(() => {
      return dispatch(actions.loginFail())
    });
};

const logout = () => dispatch => {
  dispatch(session.unsetUser());

  return apiService.Auth.logout()
    .then(() => {
      apiService.setToken(null);
      window.localStorage.setItem('usr', '');
      window.localStorage.setItem('jwt', '');
    })
    .catch(() => {
      apiService.setToken(null);
      window.localStorage.setItem('usr', '');
      window.localStorage.setItem('jwt', '');
    });
};

const badRequest = actions.badRequest;

const recoverPassword = (email) => dispatch => {
  dispatch(actions.passRecoveryReq());

  return apiService.Auth.resetPassword(email)
    .then(() => {
      return dispatch(actions.passRecoverySuccess())
    })
    .catch(() => {
      return dispatch(actions.passRecoveryFail())
    });
};

const signUp = (name, surname, email, password) => dispatch => {
  dispatch(actions.signUpReq());

  return apiService.Auth.signUp(name, surname, email, password)
    .then(() => {
      return dispatch(actions.signUpSuccess());
    })
    .catch(() => {
      return dispatch(actions.signUpFail())
    });
};

export {
  open,
  close,
  setMode,
  login,
  logout,
  badRequest,
  recoverPassword,
  signUp
}
