import * as actions from "./actions"
import apiService from "../../apiService";

const setUser = actions.setUser;

const unsetUser = actions.unsetUser;

const retrieveUser = () => dispatch => {
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
      .then(response => {
        if(JSON.stringify(user) !== JSON.stringify(response)) {
          window.localStorage.setItem('usr', JSON.stringify(response));
          dispatch(actions.setUser(response));
        }
      })
      .catch(() => {
        window.localStorage.setItem('usr', '');
        window.localStorage.setItem('jwt', '');
      });
  }
};

export {
  setUser,
  unsetUser,
  retrieveUser
}
