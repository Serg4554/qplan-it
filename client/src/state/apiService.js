import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';
import credentials from '../config/credentials.json';
import store from './store';
const agent = superagentPromise(_superagent, Promise);

const API_URL = credentials.apiUrl;
let token = null;

const setToken = (req, token) => {
  if(token) {
    req.set('authorization', token)
  }
};

const getError = (response) => {
  if(!response) {
    return {
      error: {
        statusCode: 503,
        name: "Error",
        message: "",
        code: "SERVICE_UNAVAILABLE"
      }
    }
  } else if(response.body && response.body.error) {
    return response.body;
  } else {
    return {
      error: {
        statusCode: response.status || 503,
        name: "Error",
        message: "Unknown error",
      }
    }
  }
};

const requests = {
  get: (url, _token) =>
    agent.get(`${API_URL}${url}`)
      .use(req => setToken(req, _token || token))
      .then(res => res.body || { })
      .catch(err => getError(err.response || { error : {} })),
  post: (url, body, _token) =>
    agent.post(`${API_URL}${url}`, body)
      .use(req => setToken(req, _token || token))
      .then(res => res.body || { })
      .catch(err => getError(err.response || { error : {} })),
  put: (url, body, _token) =>
    agent.put(`${API_URL}${url}`, body)
      .use(req => setToken(req, _token || token))
      .then(res => res.body || { })
      .catch(err => getError(err.response || { error : {} })),
  del: (url, _token) =>
    agent.del(`${API_URL}${url}`)
      .use(req => setToken(req, _token || token))
      .then(res => res.body || { })
      .catch(err => getError(err.response || { error : {} }))
};


/** Users REST API **/
const Auth = {
  login: (email, password) =>
    requests.post('/users/login', { email, password }),

  getUser: (id, token) =>
    requests.get(`/users/${id}`, token),

  logout: () =>
    requests.post('/users/logout', {}),

  resetPassword: (email) =>
    requests.post('/users/reset', { email }),

  signUp: (name, surname, email, password) =>
    requests.post('/users', { name, surname, email, password, language: store.getState().i18n.locale }),

  changeLostPassword: (newPassword, token) =>
    requests.post('/users/reset-password', { newPassword }, token)
};


/** Event REST API **/
const Event = {
  get: id =>
    requests.get(`/events/${id}`),
};


export default {
  Auth,
  Event,
  setToken: _token => { token = _token }
};
