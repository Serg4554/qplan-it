import * as actions from "./actions"
import apiService from "../../apiService";

const close = actions.close;

const cleanError = actions.cleanError;

const isValidToken = (id, token) => dispatch => {
  dispatch(actions.isValidToken());

  return apiService.Auth.getUser(id, token)
    .then(res => {
      if(res.error) {
        return dispatch(actions.invalidToken(res.error))
      }
      return dispatch(actions.validToken(res.email));
    });

};

const changeLostPassword = (password, token) => dispatch => {
  dispatch(actions.changePasswordReq());

  return apiService.Auth.changeLostPassword(password, token)
    .then(res => {
      if(res.error) {
        return dispatch(actions.changePasswordFail(res.error));
      }
      return dispatch(actions.changePasswordSuccess());
    });
};

export {
  close,
  cleanError,
  isValidToken,
  changeLostPassword
}
