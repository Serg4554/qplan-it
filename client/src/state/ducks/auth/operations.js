import * as actions from "./actions"
import * as session from "../session/operations"
import agent from "../../apiService";

const open = actions.open;

const close = actions.close;

const setMode = actions.setMode;

const login = (email, password) => dispatch => {
  dispatch(actions.loginReq());

  return agent.Auth.login(email, password)
    .then(loginResponse => {
      if(!loginResponse.id || !loginResponse.userId) {
        return dispatch(actions.loginFail())
      }

      agent.setToken(loginResponse.id);
      window.localStorage.setItem('jwt', loginResponse.id);

      return agent.Auth.getUser(loginResponse.userId)
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

  return agent.Auth.logout()
    .then(() => {
      agent.setToken(null);
      window.localStorage.setItem('usr', '');
      window.localStorage.setItem('jwt', '');
    })
    .catch(() => {
      agent.setToken(null);
      window.localStorage.setItem('usr', '');
      window.localStorage.setItem('jwt', '');
    });
};

const badRequest = actions.badRequest;

const recoverPassword = (email) => dispatch => {
  dispatch(actions.passRecoveryReq());

  return agent.Auth.resetPassword(email)
    .then(() => {
      return dispatch(actions.passRecoverySuccess())
    })
    .catch(() => {
      return dispatch(actions.passRecoveryFail())
    });
};

export {
  open,
  close,
  setMode,
  login,
  logout,
  badRequest,
  recoverPassword
}
