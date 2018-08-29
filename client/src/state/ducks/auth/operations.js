import * as actions from "./actions"
import * as session from "../session/operations"
import apiService from "../../apiService";

const open = actions.open;

const close = actions.close;

const setMode = actions.setMode;

const login = (email, password) => dispatch => {
  dispatch(actions.loginReq());

  return apiService.Auth.login(email, password)
    .then(loginRes => {
      if(loginRes.error) {
        return dispatch(actions.loginFail(loginRes.error))
      }

      apiService.setToken(loginRes.id);
      window.localStorage.setItem('jwt', loginRes.id);

      return apiService.Auth.getUser(loginRes.userId)
        .then(userRes => {
          dispatch(session.setUser(userRes.error ? undefined : userRes));
          return dispatch(actions.loginSuccess());
        });
    });
};

const logout = () => dispatch => {
  return apiService.Auth.logout()
    .then(() => {
      apiService.setToken(null);
      window.localStorage.setItem('jwt', '');
      dispatch(session.unsetUser());
    });
};

const cleanError = actions.cleanError;

const recoverPassword = (email, captchaToken) => dispatch => {
  dispatch(actions.passRecoveryReq());

  return apiService.Auth.resetPassword(email, captchaToken)
    .then(res => {
      return dispatch(res.error ? actions.passRecoveryFail(res.error) : actions.passRecoverySuccess())
    });
};

const signUp = (name, surname, email, password, captchaToken) => dispatch => {
  dispatch(actions.signUpReq());

  return apiService.Auth.signUp(name, surname, email, password, captchaToken)
    .then(res => {
      return dispatch(res.error ? actions.signUpFail(res.error) : actions.signUpSuccess());
    });
};

export {
  open,
  close,
  setMode,
  login,
  logout,
  cleanError,
  recoverPassword,
  signUp
}
