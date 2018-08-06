import agent from '../agent'

export const UNLOAD = 'auth/UNLOAD';
export const OPEN = 'auth/OPEN';
export const LOGIN_REQ = 'auth/LOGIN_REQ';
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS';
export const LOGIN_FAIL = 'auth/LOGIN_FAIL';
export const LOGOUT = 'auth/LOGOUT';



/** Reducers **/

let initialState = {
  user: null,
  opened: false,
  inProgress: false,
  fail: false
};

let aux;

export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN:
      return { ...state, opened: true };

    case LOGIN_REQ:
      return { ...state, inProgress: true };

    case LOGIN_SUCCESS:
      aux = Object.assign({}, initialState);
      aux.user = action.payload ? action.payload.user : null;
      return aux;

    case LOGIN_FAIL:
      return {
        ...state,
        inProgress: false,
        fail: true
      };

    case LOGOUT:
      return initialState;

    case UNLOAD:
      aux = Object.assign({}, initialState);
      aux.user = state.user;
      return aux;

    default:
      return state;
  }
};



/** Action providers **/

export const open = () => dispatch => {
  return dispatch({ type: OPEN });
};

export const login = (email, password) => dispatch => {
  dispatch({ type: LOGIN_REQ });

  return agent.Auth.login(email, password)
    .then(response => {
      if(!response.id || !response.userId) {
        return dispatch({ type: LOGIN_FAIL })
      }

      agent.setToken(response.id);
      window.localStorage.setItem('usr', response.userId);
      window.localStorage.setItem('jwt', response.id);

      return agent.Auth.getUser(response.userId)
        .then(response => {
          return dispatch({
            type: LOGIN_SUCCESS,
            payload: { user: response }
          })
        });
    })
    .catch(() => {
      return dispatch({ type: LOGIN_FAIL })
    });
};

export const logout = () => dispatch => {
  dispatch({ type: LOGOUT });

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

export const retrieveUser = () => dispatch => {
  const token = window.localStorage.getItem('jwt');
  const user = window.localStorage.getItem('usr');

  if(token) {
    agent.setToken(token)
  }

  if(user) {
    return agent.Auth.getUser(user)
      .then(response => {
        return dispatch({
          type: LOGIN_SUCCESS,
          payload: { user: response }
        })
      })
      .catch(() => {
        window.localStorage.setItem('usr', '');
        window.localStorage.setItem('jwt', '');
      });
  }
};

export const setFail = () => dispatch => {
  return dispatch({type: LOGIN_FAIL })
};

export const unload = () => dispatch => dispatch({ type: UNLOAD });
