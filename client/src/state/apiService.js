import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';
import credentials from '../config/credentials.json';
import store from './store';
const agent = superagentPromise(_superagent, Promise);

const API_URL = credentials.apiUrl;
let token = null;

const requests = {
  get: url =>
    agent.get(`${API_URL}${url}`).use(req => {if(token) req.set('authorization', token)}).then(res => res.body),
  post: (url, body) =>
    agent.post(`${API_URL}${url}`, body).use(req => {if(token) req.set('authorization', token)}).then(res => res.body),
  put: (url, body) =>
    agent.put(`${API_URL}${url}`, body).use(req => {if(token) req.set('authorization', token)}).then(res => res.body),
  del: url =>
    agent.del(`${API_URL}${url}`).use(req => {if(token) req.set('authorization', token)}).then(res => res.body)
};

const Auth = {
  login: (email, password) =>
    requests.post('/users/login', { email, password }),
  getUser: (id) =>
    requests.get(`/users/${id}`),
  logout: () =>
    requests.post('/users/logout', {}),
  resetPassword: (email) =>
    requests.post('/users/reset', { email }),
  signUp: (name, surname, email, password) => {
    const language = store.getState().i18n.locale;
    return requests.post('/users', { name, surname, email, password, language });
  },
  getUserWithToken: (id, token) =>
    agent.get(`${API_URL}/users/${id}`).use(req => {if(token) req.set('authorization', token)}).then(res => res.body),
  changeLostPassword: (newPassword, token) =>
    agent.post(`${API_URL}/users/reset-password`, { newPassword })
      .use(req => {
        if(token) req.set('authorization', token);
        req.set('Content-Type', 'application/x-www-form-urlencoded');
      }).then(res => res.body),
};

const Event = {
  get: id =>
    requests.get(`/events/${id}`),
};

export default {
  Auth,
  Event,
  setToken: _token => { token = _token }
};
